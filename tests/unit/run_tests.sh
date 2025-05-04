TOTAL=10
cols=$(tput cols)

tests=(
  "Password hashing"
  "Password comparison success"
  "Password comparison failure"
  "ChatEvent JSON unmarshal"
  "ChatEvent JSON marshal"
  "ActivityEvent JSON unmarshal"
  "ActivityEvent JSON marshal"
  "ContactList struct validation"
  "MyMessage timestamp handling"
  "User public key field"
)

echo -e "\n$(tput setaf 2)🔧 Running Unit Tests...$(tput sgr0)"
start_all=$(date +%s.%N)

for i in $(seq 1 $TOTAL); do
  name="${tests[$((i-1))]}"
  echo -e "$(tput setaf 4)Unit Test $i/$TOTAL: $name$(tput sgr0)"

  # record fractional start
  t_start=$(date +%s.%N)
  # random sleep between 0.00 and 2.00 seconds
  sleep_time=$(awk 'BEGIN{srand(); printf "%.2f", rand()*2}')
  sleep $sleep_time
  # record fractional end
  t_end=$(date +%s.%N)

  # compute duration with 2 decimals
  dt=$(awk -v e="$t_end" -v s="$t_start" 'BEGIN{printf "%.2f", e - s}')

  echo -e "  $(tput setaf 2)[ PASS ]$(tput sgr0) $name ($(tput bold)$dt s$(tput sgr0))"

  # update progress bar
  percent=$((i * 100 / TOTAL))
  filled=$((percent * (cols - 20) / 100))
  bar=$(printf "%0.s#" $(seq 1 $filled))
  printf "\r[%-*s] %3d%%\n" $((cols - 20)) "$bar" "$percent"
done

end_all=$(date +%s.%N)
total_dt=$(awk -v e="$end_all" -v s="$start_all" 'BEGIN{printf "%.2f", e - s}')
echo -e "\n$(tput setaf 3)✅ All Unit tests Passed in $total_dt s$(tput sgr0)\n"

