'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
        timezone: null,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var result = pattern.replace('%DD', this.date.day);
            this.date.hours = this.date.hours.toString();
            this.date.minutes = this.date.minutes.toString();
            if (this.date.hours.length === 1) {
                this.date.hours = '0' + this.date.hours.toString();
            }
            if (this.date.minutes.length === 1) {
                this.date.minutes = '0' + this.date.minutes.toString();
            }
            result = result.replace('%HH:%MM', (parseInt(this.date.hours) +
                this.timezone).toString() + ':' + this.date.minutes);
            return result;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
        }
    };
};
