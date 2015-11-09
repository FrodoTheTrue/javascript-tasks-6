'use strict';

var moment = require('./moment');
var MINUTES_IN_DAY = 1440;

var checkTerror = function (startWorkTime, endWorkTime, terrorTimeFormated, minDuration) {
    console.log(startWorkTime, endWorkTime);
    var minutesCount = 1;
    var needMinute = -1;
    var getAnswer = false;
    for (var i = startWorkTime;i <= endWorkTime;i++) {
        var isCorrectMinute = true;
        for (var j = 0;j < terrorTimeFormated.length;j++) {
            if (i >= terrorTimeFormated[j][0] && i <= terrorTimeFormated[j][1]) {
                isCorrectMinute = false;
            }
        }
        if (isCorrectMinute) {
            minutesCount += 1;
            if (minutesCount === minDuration) {
                getAnswer = true;
                needMinute = i - minDuration;
                break;
            }
        } else {
            minutesCount = 0;
        }
    }
    if (!getAnswer) {
        return null;
    } else {
        return needMinute;
    }
};

var parseWorkingHours = function (dateString) {
    var indexPlus = dateString.indexOf('+');
    var indexMinus = dateString.indexOf('-');
    var indexColon = dateString.indexOf(':');
    var shiftTime = 0;
    var minutes = 0;
    var hours = dateString.substr(0, indexColon);
    if (indexMinus === -1 && indexPlus === -1) {
        shiftTime = 0;
        minutes = dateString.substr(indexColon + 1, dateString.length - indexColon - 1);
    } else if (indexMinus === -1) {
        shiftTime = parseInt(dateString.substr(indexPlus + 1, dateString.length - indexPlus));
        minutes = dateString.substr(indexColon + 1, indexPlus - indexColon - 1);
    } else if (indexPlus === -1) {
        shiftTime = parseInt(dateString.substr(indexMinus + 1, dateString.length - indexMinus)) *
            (-1);
        minutes = dateString.substr(indexColon + 1, indexMinus - indexColon - 1);
    }
    return parseInt(hours) * 60 + parseInt(minutes) - shiftTime * 60;
};

var parseTerroristHours = function (dateString) {
    var indexSpace = dateString.indexOf(' ');
    var simpleDate = dateString.substr(indexSpace + 1, dateString.length - indexSpace - 1);
    var day = dateString.substr(0, 2);
    var simpleMinutes = parseWorkingHours(simpleDate);
    if (day == 'ПН') {
        return simpleMinutes;
    }
    if (day == 'ВТ') {
        return simpleMinutes + MINUTES_IN_DAY;
    }
    if (day == 'СР') {
        return simpleMinutes + MINUTES_IN_DAY * 2;
    }

};
var parseTimeZone = function (dateString) {
    var indexPlus = dateString.indexOf('+');
    var indexMinus = dateString.indexOf('-');
    if (indexMinus === -1 && indexPlus === -1) {
        return 0;
    } else if (indexMinus === -1) {
        return parseInt(dateString.substr(indexPlus + 1, dateString.length - indexPlus));
    } else if (indexPlus === -1) {
        return parseInt(dateString.substr(indexMinus + 1, dateString.length - indexMinus));
    }
};

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var terrorists = JSON.parse(json);
    var startWorkTime = parseWorkingHours(workingHours.from);
    var endWorkTime = parseWorkingHours(workingHours.to);
    appropriateMoment.timezone = parseTimeZone(workingHours.to);
    var terrorTime = [];
    for (var item in terrorists) {
        terrorists[item].forEach(function (item, i, terrorists) {
            terrorTime.push({from: item.from,
                to: item.to});
        });
    }
    var terrorTimeFormated = [];
    for (var time in terrorTime) {
        var timeObject = terrorTime[time];
        var startTime = parseTerroristHours(timeObject.from);
        var endTime = parseTerroristHours(timeObject.to);
        terrorTimeFormated.push([startTime, endTime]);
    }
    console.log(terrorTimeFormated);
    var firstDay = checkTerror(startWorkTime, endWorkTime, terrorTimeFormated, minDuration);
    var secondDay = checkTerror(startWorkTime + MINUTES_IN_DAY, endWorkTime + MINUTES_IN_DAY,
        terrorTimeFormated, minDuration);
    var thirdDay = checkTerror(startWorkTime + MINUTES_IN_DAY * 2, endWorkTime + MINUTES_IN_DAY * 2,
        terrorTimeFormated, minDuration);
    console.log(firstDay, secondDay, thirdDay);
    if (firstDay != null) {
        appropriateMoment.date = {day: 'ПН', hours: firstDay / 60, minutes: firstDay % 60};
        return appropriateMoment;
    } else if (secondDay != null) {
        appropriateMoment.date = {day: 'ВТ', hours: (secondDay - MINUTES_IN_DAY) / 60,
            minutes: (secondDay - MINUTES_IN_DAY) % 60};
        return appropriateMoment;
    } else if (thirdDay != null) {
        appropriateMoment.date = {day: 'СР', hours: (thirdDay - MINUTES_IN_DAY * 2) / 60,
            minutes: (thirdDay - MINUTES_IN_DAY * 2) % 60};
        return appropriateMoment;
    } else {
        return null;
    }
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};
