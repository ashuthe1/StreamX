BASE_URL=${1:-http://localhost:3000/api}


echo "\n============================================================"
echo "🏁 Starting All Tests"
echo "============================================================\n"

echo ">>> [1/3] Unit Tests"
bash unit/run_tests.sh
echo "\n------------------------------------------------------------\n"

echo ">>> [2/3] Integration Tests"
bash integration/run_tests.sh
echo "\n------------------------------------------------------------\n"

echo ">>> [3/3] System Tests (using API at $BASE_URL)"
bash system/run_tests.sh "$BASE_URL"
echo "\n============================================================"
echo "🎉 All Tests Complete"
echo "============================================================\n"