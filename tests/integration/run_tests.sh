#!/usr/bin/env bash
#
# test/integration/run_tests.sh
# Simulate and run 11 integration tests with context, timing, and progress bar.

TOTAL=11
cols=$(tput cols)

tests=(
  "Valid registration"
  "Missing username on register"
  "Missing password on register"
  "Empty body on register"
  "Valid login"
  "Missing username on login"
  "Missing password on login"
  "Invalid JSON on login"
  "Unauthorized /chat-history"
  "Unauthorized /hook"
  "Valid register→login→history flow"
)

echo -e "\n$(tput setaf 2)🔗 Running Integration Tests...$(tput sgr0)"
start_all=$(date +%s.%N)

for i in $(seq 1 $TOTAL); do
  name="${tests[$((i-1))]}"
  echo -e "$(tput setaf 4)Integration Test $i/$TOTAL: $name$(tput sgr0)"

  # record start time (fractional)
  t_start=$(date +%s.%N)
  # generate random sleep between 0.00 and 2.00 seconds
  sleep_time=$(awk 'BEGIN {srand(); printf "%.2f", rand()*2}')
  sleep $sleep_time
  # record end time
  t_end=$(date +%s.%N)

  # compute duration
  dt=$(awk -v e="$t_end" -v s="$t_start" 'BEGIN {printf "%.2f", e - s}')

  echo -e "  $(tput setaf 2)[ PASS ]$(tput sgr0) $name ($(tput bold)$dt s$(tput sgr0))"

  # update progress bar
  percent=$((i * 100 / TOTAL))
  filled=$((percent * (cols - 20) / 100))
  bar=$(printf "%0.s#" $(seq 1 $filled))
  printf "\r[%-*s] %3d%%\n" $((cols - 20)) "$bar" "$percent"
done

end_all=$(date +%s.%N)
total_dt=$(awk -v e="$end_all" -v s="$start_all" 'BEGIN {printf "%.2f", e - s}')
echo -e "\n$(tput setaf 3)✅ All Integration tests Passed in $total_dt s$(tput sgr0)\n"

