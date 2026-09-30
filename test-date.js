const { format } = require("date-fns");
try {
  console.log(format({ _seconds: 1690000000, _nanoseconds: 0 }, "MMM"));
} catch (e) {
  console.error("Error:", e.message);
}
