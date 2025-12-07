#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/bench_ssr.sh "/your/path"               # defaults
#        TARGET_PATH=/foo DURATION=60s CONCURRENCY=200 ./scripts/bench_ssr.sh
#
# Required:
#   - Provide SERVER_CMD (default: "go run ./cmd/website/... --bind :PORT")
#   - Have wrk or vegeta in PATH for load generation.
# Notes:
#   - Starts one engine at a time (v8 then goja), each on a different port.
#   - Collects wrk/vegeta report, pprof cpu/heap, and a ps snapshot.

TARGET_PATH="${1:-/}"
ENGINES="${ENGINES:-v8 goja}"
SERVER_CMD="${SERVER_CMD:-go run ./cmd/website/... --bind :PORT}"
PORT_BASE="${PORT_BASE:-8080}"
DURATION="${DURATION:-30s}"
CONCURRENCY="${CONCURRENCY:-100}"
THREADS="${THREADS:-4}"
RATE="${RATE:-0}" # vegeta requests per second; 0 => use CONCURRENCY as rate*10

WRK_BIN="${WRK_BIN:-$(command -v wrk || true)}"
VEGETA_BIN="${VEGETA_BIN:-$(command -v vegeta || true)}"

if [[ -z "${WRK_BIN}${VEGETA_BIN}" ]]; then
  echo "need wrk or vegeta in PATH" >&2
  exit 1
fi

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

start_server() {
  local engine="$1" port="$2" logfile="$3"
  local cmd="${SERVER_CMD//:PORT/:$port}"
  echo "starting ${engine} on :${port} ..." >&2
  ENABLE_PPROF=1 SSR_ENGINE="$engine" GOCACHE="${tmpdir}/gocache-${engine}" \
    bash -c "$cmd" >"$logfile" 2>&1 &
  echo $!
}

wait_healthy() {
  local port="$1" retries=120  # 60秒超时 (go run 编译需要时间)
  while (( retries-- )); do
    if curl -fs "http://127.0.0.1:${port}${TARGET_PATH}" >/dev/null 2>&1; then
      echo "server on :${port} is healthy" >&2
      return 0
    fi
    sleep 0.5
  done
  return 1
}

run_wrk() {
  local port="$1"
  # --timeout 设置为 10s 避免高并发下的超时
  "$WRK_BIN" -t "$THREADS" -c "$CONCURRENCY" -d "$DURATION" --timeout 10s "http://127.0.0.1:${port}${TARGET_PATH}"
}

run_vegeta() {
  local port="$1" out="$2"
  local r="$RATE"
  [[ "$r" -eq 0 ]] && r=$((CONCURRENCY * 10))
  echo "GET http://127.0.0.1:${port}${TARGET_PATH}" | "$VEGETA_BIN" attack -duration="$DURATION" -rate="$r" >"$out"
  "$VEGETA_BIN" report <"$out"
}

collect_pprof() {
  local port="$1" engine="$2"
  curl -s -o "${tmpdir}/profile-${engine}.pb.gz" "http://127.0.0.1:${port}/debug/pprof/profile?seconds=15" || true
  curl -s -o "${tmpdir}/heap-${engine}.pb.gz" "http://127.0.0.1:${port}/debug/pprof/heap" || true
}

snapshot_ps() {
  local pid="$1" engine="$2"
  ps -o pid,%cpu,%mem,rss,etime -p "$pid" | sed "1s/$/ (${engine})/"
}

# 使用文件存储结果 (兼容旧版 bash)
summary_file="${tmpdir}/summary.txt"
touch "$summary_file"

idx=0
for engine in $ENGINES; do
  port=$((PORT_BASE + idx))
  idx=$((idx + 1))
  logfile="${tmpdir}/server-${engine}.log"
  pid=$(start_server "$engine" "$port" "$logfile")
  if ! wait_healthy "$port"; then
    echo "server ${engine} on :${port} not healthy; log: $logfile" >&2
    if [[ -f "$logfile" ]]; then
      echo "--- last log lines ---" >&2
      tail -n 50 "$logfile" >&2 || true
      echo "----------------------" >&2
    fi
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
    continue
  fi

  echo "== ${engine} (port ${port}) =="
  snapshot_ps "$pid" "$engine" | tee "${tmpdir}/ps-${engine}-before.txt"

  # 后台采集 pprof (与压测并行)
  collect_pprof "$port" "$engine" &
  pprof_pid=$!

  rps="N/A"
  lat="N/A"

  if [[ -n "$WRK_BIN" ]]; then
    run_wrk "$port" | tee "${tmpdir}/wrk-${engine}.txt"
    # 提取关键指标 (macOS 兼容: 使用 sed 替代 grep -P)
    rps=$(sed -n 's/.*Requests\/sec:[[:space:]]*\([0-9.]*\).*/\1/p' "${tmpdir}/wrk-${engine}.txt" || echo "N/A")
    lat=$(sed -n 's/.*Latency[[:space:]]*\([0-9.]*[a-z]*\).*/\1/p' "${tmpdir}/wrk-${engine}.txt" | head -1 || echo "N/A")
  else
    run_vegeta "$port" "${tmpdir}/vegeta-${engine}.bin" | tee "${tmpdir}/vegeta-${engine}.txt"
    rps=$(sed -n 's/.*Throughput:[[:space:]]*\([0-9.]*\).*/\1/p' "${tmpdir}/vegeta-${engine}.txt" || echo "N/A")
    lat=$(sed -n 's/.*mean[[:space:]]*\([0-9.]*[a-zµ]*\).*/\1/p' "${tmpdir}/vegeta-${engine}.txt" | head -1 || echo "N/A")
  fi

  # 保存结果到文件
  echo "${engine}|${rps}|${lat}" >> "$summary_file"

  wait "$pprof_pid" 2>/dev/null || true
  snapshot_ps "$pid" "$engine" | tee "${tmpdir}/ps-${engine}-after.txt"

  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
  sleep 1
done

# 汇总对比
echo ""
echo "========================================"
echo "           BENCHMARK SUMMARY            "
echo "========================================"
printf "%-10s %-15s %-15s\n" "ENGINE" "RPS" "LATENCY"
echo "----------------------------------------"
while IFS='|' read -r eng rps lat; do
  printf "%-10s %-15s %-15s\n" "$eng" "$rps" "$lat"
done < "$summary_file"
echo "========================================"

echo ""
echo "artifacts in $tmpdir:"
ls -l "$tmpdir"
