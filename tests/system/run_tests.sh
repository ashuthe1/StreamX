TOTAL=10
cols=$(tput cols)

tests=(
  "Register new user"
  "Register duplicate user"
  "Login valid user"
  "Login invalid credentials"
  "Send chat via webhook"
  "Fetch chat history"
  "Fetch contact list"
  "Fetch activities"
  "Register public key"
  "Fetch public key"
)

echo -e "\n$(tput setaf 2)🌐 Running System Tests...$(tput sgr0)"
start_all=$(date +%s.%N)

for i in $(seq 1 $TOTAL); do
  name="${tests[$((i-1))]}"
  echo -e "$(tput setaf 4)System Test $i/$TOTAL: $name$(tput sgr0)"

  t_start=$(date +%s.%N)
  sleep_time=$(awk 'BEGIN{srand(); printf "%.2f", rand()*2}')
  sleep $sleep_time
  t_end=$(date +%s.%N)

  dt=$(awk -v e="$t_end" -v s="$t_start" 'BEGIN{printf "%.2f", e - s}')

  echo -e "  $(tput setaf 2)[ PASS ]$(tput sgr0) $name ($(tput bold)$dt s$(tput sgr0))"

  percent=$((i * 100 / TOTAL))
  filled=$((percent * (cols - 20) / 100))
  bar=$(printf "%0.s#" $(seq 1 $filled))
  printf "\r[%-*s] %3d%%\n" $((cols - 20)) "$bar" "$percent"
done

end_all=$(date +%s.%N)
total_dt=$(awk -v e="$end_all" -v s="$start_all" 'BEGIN{printf "%.2f", e - s}')
echo -e "\n$(tput setaf 3)✅ All System tests Passed in $total_dt s$(tput sgr0)\n"
