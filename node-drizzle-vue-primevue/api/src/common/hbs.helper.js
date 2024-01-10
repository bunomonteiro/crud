const hbs = require("hbs");
const dayjs = require("dayjs");

function Helper() {
  this.registerHelpers = function () {
    hbs.registerHelper("json", (context) => {
      return JSON.stringify(context, null, 2);
    });

    hbs.registerHelper("ternary", (test, yes, no) => {
      return test ? yes : no;
    });

    hbs.registerHelper("jseval", function (expr) {
      if (arguments.length < 2)
        throw new Error("Handlerbars Helper 'jseval' needs 1 parameter");

      with (this) {
        return eval(expr);
      }
    });

    hbs.registerHelper("formatDate", function (date, format) {
      return dayjs(date).format(format);
    });
  };
}

module.exports = new Helper();
