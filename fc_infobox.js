function scientificNotation(value) {
    if (
        value === 0 ||
        !Number.isFinite(value) ||
        (Math.abs(value) >= 1 && Math.abs(value) <= 1000)
    ) {
        return rawFormatter(value);
    }
    value = parseFloat(value);
    value = value.toExponential(2);
    value = value.replace("+", "");
    return value;
}

// Implemented much better in base mod so just call that for raw, long, and short
// Used by FrozenCookies.numberDisplay in fcBeautify
var numberFormatters = [
    rawFormatter,
    formatEveryThirdPower(formatLong), // 1: long: millions, billions etc.
    formatEveryThirdPower(formatShort), // 2: short: M, B, T etc.
    formatEveryThirdPower([
        // 3: SI prefixes: M, G, T etc.
        "",
        " M",
        " G",
        " T",
        " P",
        " E",
        " Z",
        " Y",
        " R",
        " Q",
    ]),
    scientificNotation, // 4: scientific: 6.3e12 etc.
];

function fcBeautify(value) {
    var negative = value < 0;
    value = Math.abs(value);
    // There are no SI prefixes larger than 1e30, so we'll use scientific notation
    // The game will show Infinity otherwise, which is not useful
    if (FrozenCookies.numberDisplay === 3 && value >= 1e33) {
        // Use scientificNotation (case 4)
        var output = numberFormatters[4](value)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return negative ? "-" + output : output;
    }
    var formatter = numberFormatters[FrozenCookies.numberDisplay];
    var output = formatter(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return negative ? "-" + output : output;
}

// Runs numbers in upgrades and achievements through our beautify function
function beautifyUpgradesAndAchievements() {
    function beautifyFn(str) {
        return Beautify(parseInt(str.replace(/,/, ""), 10));
    }

    var numre = /\d\d?\d?(?:,\d\d\d)*/;
    Object.values(Game.AchievementsById).forEach(function (ach) {
        ach.desc = ach.desc.replace(numre, beautifyFn);
    });

    // These might not have any numbers in them, but just in case...
    Object.values(Game.UpgradesById).forEach(function (upg) {
        upg.desc = upg.desc.replace(numre, beautifyFn);
    });
}

function timeDisplay(seconds) {
    if (seconds === "---" || seconds === 0) {
        return "Done!";
    } else if (seconds == Number.POSITIVE_INFINITY) {
        return "Never!";
    }
    seconds = Math.floor(seconds);
    var years, days, hours, minutes;
    years = Math.floor(seconds / (365.25 * 24 * 60 * 60));
    years = years > 0 ? Beautify(years) + "y " : "";
    seconds %= 365.25 * 24 * 60 * 60;
    days = Math.floor(seconds / (24 * 60 * 60));
    days = days > 0 ? days + "d " : "";
    seconds %= 24 * 60 * 60;
    hours = Math.floor(seconds / (60 * 60));
    hours = hours > 0 ? hours + "h " : "";
    seconds %= 60 * 60;
    minutes = Math.floor(seconds / 60);
    minutes = minutes > 0 ? minutes + "m " : "";
    seconds %= 60;
    seconds = seconds > 0 ? seconds + "s" : "";
    return (years + days + hours + minutes + seconds).trim();
}

// functionality for the infobox
function drawCircles(t_d, x, y) {
    var maxRadius,
        heightOffset,
        i_c,
        i_tc,
        t_b,
        maxWidth,
        maxHeight,
        s_t,
        c = $("#backgroundLeftCanvas");
    if (typeof c.measureText != "function") {
        return;
    }
    maxRadius =
        10 +
        10 *
            t_d.reduce(function (sum, item) {
                return item.overlay ? sum : sum + 1;
            }, 0);
    heightOffset = maxRadius + 5 - (15 * (t_d.length - 1)) / 2;
    i_c = 0;
    i_tc = 0;
    t_b = [
        "rgba(170, 170, 170, 1)",
        "rgba(187, 187, 187, 1)",
        "rgba(204, 204, 204, 1)",
        "rgba(221, 221, 221, 1)",
        "rgba(238, 238, 238, 1)",
        "rgba(255, 255, 255, 1)",
    ];
    var maxText = _.max(
        t_d.map(function (o) {
            return o.name ? o.name + (o.display ? ": " + o.display : "") : "";
        }),
        function (str) {
            return str.length;
        }
    );
    var maxMeasure = c.measureText({
        fontSize: "12px",
        fontFamily: "Arial",
        maxWidth: c.width,
        text: maxText,
    });
    maxWidth = maxMeasure.width;
    maxHeight = maxMeasure.height * t_d.length;
    if (FrozenCookies.fancyui % 2 == 1)
        c.drawRect({
            fillStyle: "rgba(153, 153, 153, 0.6)",
            x: x + maxRadius * 2 + maxWidth / 2 + 35,
            y: y + maxRadius + 5,
            width: maxWidth + 20,
            height: maxHeight + 20,
        });

    t_d.forEach(function (o_draw) {
        if (o_draw.overlay) {
            i_c--;
        } else {
            if (FrozenCookies.fancyui > 1) {
                c.drawArc({
                    strokeStyle: t_b[i_c % t_b.length],
                    strokeWidth: 10,
                    x: x + (maxRadius + 5),
                    y: y + maxRadius + 5,
                    radius: maxRadius - i_c * 10,
                });
                c.drawArc({
                    strokeStyle: t_b[(i_c + 2) % t_b.length],
                    strokeWidth: 1,
                    x: x + (maxRadius + 5),
                    y: y + maxRadius + 5,
                    radius: maxRadius - 5 - i_c * 10,
                });
            }
        }
        if (FrozenCookies.fancyui > 1) {
            c.drawArc({
                strokeStyle: o_draw.c1,
                x: x + (maxRadius + 5),
                y: y + maxRadius + 5,
                radius: maxRadius - i_c * 10,
                strokeWidth: 7,
                start: 0,
                end: 360 * o_draw.f_percent,
            });
        }
        if (FrozenCookies.fancyui % 2 == 1 && o_draw.name) {
            s_t = o_draw.name + (o_draw.display ? ": " + o_draw.display : "");
            c.drawText({
                fontSize: "12px",
                fontFamily: "Arial",
                fillStyle: o_draw.c1,
                x: x + maxRadius * 2 + maxWidth / 2 + 35,
                y: y + heightOffset + 15 * i_tc,
                text: s_t,
            });
            i_tc++;
        }
        i_c++;
    });
}

function hasBuildingSpecialBuff() {
    for (var i in Game.buffs) {
        if (
            Game.buffs[i].type &&
            (Game.buffs[i].type.name == "building buff" ||
                Game.buffs[i].type.name == "building debuff")
        ) {
            return Game.buffs[i].time;
        }
    }
    return 0;
}

function buildingSpecialBuffValue() {
    for (var i in Game.buffs) {
        if (
            Game.buffs[i].type &&
            (Game.buffs[i].type.name == "building buff" ||
                Game.buffs[i].type.name == "building debuff")
        ) {
            return Game.buffs[i].multCpS;
        }
    }
    return 0;
}

function buffDuration(buffName) {
    var buff = Game.hasBuff(buffName);
    return buff ? buff.time : 0;
}

function updateTimers() {
    // update infobox calculations and assemble output -- called every draw tick
    var chainPurchase,
        bankPercent,
        purchasePercent,
        bankMax,
        actualCps,
        t_draw,
        maxColor,
        height,
        gc_delay =
            (probabilitySpan("golden", Game.shimmerTypes.golden.time, 0.5) -
                Game.shimmerTypes.golden.time) /
            maxCookieTime(),
        gc_max_delay =
            (probabilitySpan("golden", Game.shimmerTypes.golden.time, 0.99) -
                Game.shimmerTypes.golden.time) /
            maxCookieTime(),
        gc_min_delay =
            (probabilitySpan("golden", Game.shimmerTypes.golden.time, 0.01) -
                Game.shimmerTypes.golden.time) /
            maxCookieTime(),
        clot_delay = buffDuration("Clot") / maxCookieTime(),
        elder_frenzy_delay = buffDuration("Elder frenzy") / maxCookieTime(),
        frenzy_delay = buffDuration("Frenzy") / maxCookieTime(),
        dragon_harvest_delay = buffDuration("Dragon Harvest") / maxCookieTime(),
        click_frenzy_delay = buffDuration("Click frenzy") / maxCookieTime(),
        dragonflight_delay = buffDuration("Dragonflight") / maxCookieTime(),
        cursed_finger_delay = buffDuration("Cursed finger") / maxCookieTime(),
        building_special_delay = hasBuildingSpecialBuff() / maxCookieTime(),
        cookie_storm_delay = buffDuration("Cookie storm") / maxCookieTime(),
        // useless decimal_HC_complete = (Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset)%1),
        bankTotal = delayAmount(),
        purchaseTotal = nextPurchase().cost,
        bankCompletion = bankTotal
            ? Math.min(Game.cookies, bankTotal) / bankTotal
            : 0,
        purchaseCompletion = Game.cookies / (bankTotal + purchaseTotal),
        bankPurchaseCompletion = bankTotal / (bankTotal + purchaseTotal),
        chainTotal = 0,
        chainFinished,
        chainCompletion = 0;
    c = $("#backgroundLeftCanvas");
    if (nextChainedPurchase().cost > nextPurchase().cost) {
        chainPurchase = nextChainedPurchase().purchase;
        chainTotal =
            upgradePrereqCost(chainPurchase, true) - chainPurchase.getPrice();
        chainFinished =
            chainTotal -
            (upgradePrereqCost(chainPurchase) - chainPurchase.getPrice());
        chainCompletion =
            (chainFinished + Math.max(Game.cookies - bankTotal, 0)) /
            (bankTotal + chainTotal);
    }
    bankPercent =
        Math.min(Game.cookies, bankTotal) / (bankTotal + purchaseTotal);
    purchasePercent = purchaseTotal / (purchaseTotal + bankTotal);
    bankMax = bankTotal / (purchaseTotal + bankTotal);
    actualCps =
        Game.cookiesPs + Game.mouseCps() * FrozenCookies.cookieClickSpeed;

    t_draw = [];

    if (chainTotal) {
        t_draw.push({
            f_percent: chainCompletion,
            c1: "rgba(51, 51, 51, 1)",
            name: "Chain to: " + decodeHtml(chainPurchase.name),
            display: timeDisplay(
                divCps(
                    Math.max(
                        chainTotal + bankTotal - Game.cookies - chainFinished,
                        0
                    ),
                    actualCps
                )
            ),
        });
    }
    if (
        purchaseTotal > 0 &&
        nextPurchase().type == "building" &&
        Game.season == "fools"
    ) {
        t_draw.push({
            f_percent: purchaseCompletion,
            c1: "rgba(17, 17, 17, 1)",
            name:
                "Next: " +
                decodeHtml(Game.foolObjects[nextPurchase().purchase.name].name),
            display: timeDisplay(
                divCps(
                    Math.max(purchaseTotal + bankTotal - Game.cookies, 0),
                    actualCps
                )
            ),
        });
    } else {
        t_draw.push({
            f_percent: purchaseCompletion,
            c1: "rgba(17, 17, 17, 1)",
            name: "Next: " + decodeHtml(nextPurchase().purchase.name),
            display: timeDisplay(
                divCps(
                    Math.max(purchaseTotal + bankTotal - Game.cookies, 0),
                    actualCps
                )
            ),
        });
    }
    if (bankMax > 0) {
        if (bankPercent > 0 && Game.cookies < bankTotal) {
            t_draw.push({
                f_percent: bankPercent,
                c1: "rgba(252, 212, 0, 1)",
                name: "Bank Completion",
                display: timeDisplay(
                    divCps(Math.max(bankTotal - Game.cookies, 0), actualCps)
                ),
                overlay: true,
            });
        }
    }
    if (gc_delay > 0) {
        t_draw.push({
            f_percent: gc_max_delay,
            c1: "rgba(255, 155, 0, 1)",
            name: "GC Maximum (99%)",
            display: timeDisplay((gc_max_delay * maxCookieTime()) / Game.fps),
        });
        t_draw.push({
            f_percent: gc_delay,
            c1: "rgba(255, 222, 95, 1)",
            name: "GC Estimate (50%)",
            display: timeDisplay((gc_delay * maxCookieTime()) / Game.fps),
            overlay: true,
        });
        t_draw.push({
            f_percent: gc_min_delay,
            c1: "rgba(255, 235, 0, 1)",
            name: "GC Minimum (1%)",
            display: timeDisplay((gc_min_delay * maxCookieTime()) / Game.fps),
            overlay: true,
        });
    }
    if (clot_delay > 0) {
        t_draw.push({
            f_percent: clot_delay,
            c1: "rgba(255, 54, 5, 1)",
            name: "Clot (x" + Game.buffs["Clot"].multCpS + ") Time",
            display: timeDisplay(buffDuration("Clot") / Game.fps),
        });
    }
    if (elder_frenzy_delay > 0) {
        t_draw.push({
            f_percent: elder_frenzy_delay,
            c1: "rgba(79, 0, 7, 1)",
            name:
                "Elder Frenzy (x" +
                Game.buffs["Elder frenzy"].multCpS +
                ") Time",
            display: timeDisplay(buffDuration("Elder frenzy") / Game.fps),
        });
    }
    if (frenzy_delay > 0) {
        t_draw.push({
            f_percent: frenzy_delay,
            c1: "rgba(255, 222, 95, 1)",
            name: "Frenzy (x" + Game.buffs["Frenzy"].multCpS + ") Time",
            display: timeDisplay(buffDuration("Frenzy") / Game.fps),
        });
    }
    if (dragon_harvest_delay > 0) {
        t_draw.push({
            f_percent: dragon_harvest_delay,
            c1: "rgba(206, 180, 49, 1)",
            name:
                "Dragon Harvest (x" +
                Game.buffs["Dragon Harvest"].multCpS +
                ") Time",
            display: timeDisplay(buffDuration("Dragon Harvest") / Game.fps),
        });
    }
    if (click_frenzy_delay > 0) {
        t_draw.push({
            f_percent: click_frenzy_delay,
            c1: "rgba(0, 196, 255, 1)",
            name:
                "Click Frenzy (x" +
                Game.buffs["Click frenzy"].multClick +
                ") Time",
            display: timeDisplay(buffDuration("Click frenzy") / Game.fps),
        });
    }
    if (dragonflight_delay > 0) {
        t_draw.push({
            f_percent: dragonflight_delay,
            c1: "rgba(183, 206, 49, 1)",
            name:
                "Dragonflight (x" +
                Game.buffs["Dragonflight"].multClick +
                ") Time",
            display: timeDisplay(buffDuration("Dragonflight") / Game.fps),
        });
    }
    if (cursed_finger_delay > 0) {
        t_draw.push({
            f_percent: cursed_finger_delay,
            c1: "rgba(23, 79, 1, 1)",
            name: "Cursed Finger Time",
            display: timeDisplay(buffDuration("Cursed finger") / Game.fps),
        });
    }
    if (building_special_delay > 0) {
        t_draw.push({
            f_percent: building_special_delay,
            c1: "rgba(218, 165, 32, 1)",
            name: "Building Special (x" + buildingSpecialBuffValue() + ") Time",
            display: timeDisplay(hasBuildingSpecialBuff() / Game.fps),
        });
    }
    if (cookie_storm_delay > 0) {
        t_draw.push({
            f_percent: cookie_storm_delay,
            c1: "rgba(0, 196, 255, 1)",
            name: "Cookie Storm Time",
            display: timeDisplay(buffDuration("Cookie storm") / Game.fps),
        });
    }
    height = $("#backgroundLeftCanvas").height() - 140;
    drawCircles(t_draw, 20, height);

    // Calculate currentFrenzy before drawing it
    var currentFrenzy = cpsBonus() * clickBuffBonus();
    // Draw the current frenzy at the bottom of the canvas
    if (FrozenCookies.fancyui && typeof c.drawText === "function") {
        c.removeLayer && c.removeLayer("fcCurrentFrenzyText");
        c.drawText({
            layer: true,
            name: "fcCurrentFrenzyText",
            fontSize: "14px",
            fontFamily: "Arial",
            fillStyle: "#fff",
            x: c.width() / 2,
            y: c.height() - 18,
            text: "Frenzy: " + fcBeautify(currentFrenzy),
            align: "center",
            baseline: "bottom",
        });
    }
}