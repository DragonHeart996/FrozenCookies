// This file replaces the Info button with the Frozen Cookies button
// which adds a new menu for Frozen Cookies

$("#logButton").before(
    $("<div>")
        .attr("id", "fcButton")
        .addClass("button panelButton")
        .html("Frozen<br />Cookies")
        .click(function () {
            Game.ShowMenu("fc_menu");
        })
);

$("#logButton").hide();

$("<style>")
    .prop("type", "text/css")
    .text(
        "#fcEfficiencyTable {width: 100%;}" +
            "#fcButton {top: 0px; right: 0px; padding-top: 12px; font-size: 90%; background-position: -100px 0px;}" +
            ".worst {border-width:1px; border-style:solid; border-color:#330000;}" +
            ".bad {border-width:1px; border-style:solid; border-color:#660033;}" +
            ".average {border-width:1px; border-style:solid; border-color:#663399;}" +
            ".good {border-width:1px; border-style:solid; border-color:#3399FF;}" +
            ".best {border-width:1px; border-style:solid; border-color:#00FFFF;}" +
            ".ui-dialog {z-index:1000000;}"
    )
    .appendTo("head");

function getBuildingTooltip(purchaseRec) {
    var parent = $("<div>").prop("style", "min-width:300px;");
    parent.append(
        $("<div>")
            .addClass("price")
            .prop("style", "float:right;")
            .text(Beautify(purchaseRec.purchase.price))
    );
    parent.append($("<div>").addClass("name").text(purchaseRec.purchase.name));
    parent.append(
        $("<div>")
            .prop("style", "font-size:80%;")
            .text("[owned: " + purchaseRec.purchase.amount + "]")
    );
    parent.append(
        $("<div>").addClass("description").html(purchaseRec.purchase.desc)
    );
    if (purchaseRec.delta_cps) {
        parent.append(
            $("<div>")
                .addClass("fc_cps")
                .html("Δ CPS: " + Beautify(purchaseRec.delta_cps))
        );
        parent.append(
            $("<div>")
                .addClass("fc_efficiency")
                .text(
                    "Efficiency: " +
                        (
                            Math.floor(purchaseRec.efficiencyScore * 10000) /
                            100
                        ).toString() +
                        "%"
                )
        );
        parent.append(
            $("<div>")
                .addClass("fc_build_time")
                .text(
                    "Build time: " +
                        timeDisplay(
                            divCps(
                                purchaseRec.cost + delayAmount(),
                                Game.cookiesPs
                            )
                        )
                )
        );
        parent.append(
            $("<div>")
                .addClass("fc_effective_build_time")
                .text(
                    "Estimated Effective Build time: " +
                        timeDisplay(
                            divCps(
                                purchaseRec.cost + delayAmount(),
                                effectiveCps()
                            )
                        )
                )
        );
    }
    return parent[0].outerHTML;
}

function getUpgradeTooltip(purchaseRec) {
    var parent = $("<div>").prop("style", "min-width:300px;");
    parent.append(
        $("<div>")
            .addClass("price")
            .attr("style", "float:right;")
            .text(Beautify(purchaseRec.purchase.getPrice()))
    );
    parent.append($("<div>").addClass("name").text(purchaseRec.purchase.name));
    parent.append($("<div>").prop("style", "font-size:80%;").text("[Upgrade]"));
    parent.append(
        $("<div>").addClass("description").html(purchaseRec.purchase.desc)
    );
    if (purchaseRec.delta_cps) {
        parent.append(
            $("<div>")
                .addClass("fc_cps")
                .html("Δ CPS: " + Beautify(purchaseRec.delta_cps))
        );
        parent.append(
            $("<div>")
                .addClass("fc_efficiency")
                .text(
                    "Efficiency: " +
                        (
                            Math.floor(purchaseRec.efficiencyScore * 10000) /
                            100
                        ).toString() +
                        "%"
                )
        );
        parent.append(
            $("<div>")
                .addClass("fc_build_time")
                .text(
                    "Build time: " +
                        timeDisplay(
                            divCps(
                                purchaseRec.cost + delayAmount(),
                                Game.cookiesPs
                            )
                        )
                )
        );
        parent.append(
            $("<div>")
                .addClass("fc_effective_build_time")
                .text(
                    "Estimated GC Build time: " +
                        timeDisplay(
                            divCps(
                                purchaseRec.cost + delayAmount(),
                                effectiveCps()
                            )
                        )
                )
        );
    }
    return parent[0].outerHTML;
}

function colorizeScore(score) {
    var classNames = ["best", "good", "average", "bad", "worst"];
    var result;
    if (score == 1) {
        result = classNames[0];
    } else if (score > 0.9) {
        result = classNames[1];
    } else if (score > 0.1) {
        result = classNames[2];
    } else if (score > 0) {
        result = classNames[3];
    } else {
        result = classNames[4];
    }
    return result;
}

function rebuildStore(recalculate) {
    var store = $("#products"),
        recommendations = recommendationList(recalculate);

    store[0].innerHTML = "";
    Game.ObjectsById.forEach(function (me) {
        var purchaseRec = recommendations.filter(function (a) {
                return a.id == me.id && a.type == "building";
            })[0],
            button = $("<div>")
                .addClass("product")
                .addClass(colorizeScore(purchaseRec.efficiencyScore))
                .mouseenter(function () {
                    Game.tooltip.draw(
                        this,
                        escape(getBuildingTooltip(purchaseRec)),
                        0,
                        0,
                        "left"
                    );
                })
                .mouseleave(function () {
                    Game.tooltip.hide();
                })
                .click(function () {
                    Game.ObjectsById[me.id].buy();
                })
                .prop("id", "product" + me.id)
                .append(
                    $("<div>")
                        .addClass("icon")
                        .prop(
                            "style",
                            "background-image:url(img/" + me.icon + ".png);"
                        )
                );
        content = $("<div>").addClass("content");

        content.append($("<div>").addClass("title").html(me.displayName));
        content.append($("<div>").addClass("price").text(Beautify(me.price)));
        if (me.amount) {
            content.append(
                $("<div>").addClass("title owned").text(Beautify(me.amount))
            );
        }
        button.append(content);
        store.append(button);
    });
    //  Game.Draw();
}

function rebuildUpgrades(recalculate) {
    var store = $("#upgrades"),
        recommendations = recommendationList(recalculate);
    store[0].innerHTML = "";
    Game.UpgradesInStore = Game.UpgradesById.filter(function (a) {
        return !a.bought && a.unlocked;
    }).sort(function (a, b) {
        return a.getPrice() - b.getPrice();
    });
    Game.UpgradesInStore.forEach(function (me) {
        var purchaseRec = recommendations.filter(function (a) {
            return a.id == me.id && a.type == "upgrade";
        })[0];
        if (!purchaseRec) {
            console.log(me.name + " not found in recommendationList()");
        } else {
            store.append(
                $("<div>")
                    .addClass("crate upgrade")
                    .addClass(colorizeScore(purchaseRec.efficiencyScore))
                    .mouseenter(function () {
                        Game.tooltip.draw(
                            this,
                            escape(getUpgradeTooltip(purchaseRec)),
                            0,
                            16,
                            "bottom-right"
                        );
                    })
                    .mouseleave(function () {
                        Game.tooltip.hide();
                    })
                    .click(function () {
                        Game.UpgradesById[me.id].buy();
                    })
                    .prop("id", "upgrade" + me.id)
                    .prop(
                        "style",
                        "background-position:" +
                            (-me.icon[0] * 48 + 6) +
                            "px " +
                            (-me.icon[1] * 48 + 6) +
                            "px;"
                    )
            );
        }
    });
    //  Game.Draw();
}

if (typeof Game.oldUpdateMenu != "function") {
    Game.oldUpdateMenu = Game.UpdateMenu;
}

// Add custom styles
(function () {
    var style = document.createElement("style");
    style.innerHTML = `
        .fc-multichoice-group-vertical {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin: 4px 0;
        }
        .fc-multichoice-btn,
        .option {
            background: #111;
            color: #fff;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 4px 10px;
            margin: 0;
            cursor: pointer;
            font-size: 1em;
            text-align: left;
            transition: background 0.2s, color 0.2s, box-shadow 0.2s;
            opacity: 0.7; /* Default: greyed out */
            filter: grayscale(30%);
        }
        .fc-multichoice-group-vertical .selected,
        .option.selected {
            background: #222;
            color: #fff;
            font-weight: bold;
            opacity: 1;
            filter: none;
            /* Add shiny effect */
            box-shadow: 0 0 8px 2px #fff, 0 0 2px 1px #fff inset; /* Keep shiny effect, but neutral color */
        }
        .fc-multichoice-group-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            margin: 4px 0;
        }
        .fc-multichoice-group-3col {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 4px;
            margin: 4px 0;
        }
        .fc-multichoice-btn:hover,
        .option:hover {
            background: #222;
            color: #fff;
            opacity: 1;
            filter: none;
            box-shadow: 0 0 8px 2px #fff, 0 0 2px 1px #cfc inset;
        }
        .fc-section-heading {
            font-variant: small-caps;
            font-weight: bold;
            letter-spacing: 1px;
            font-size: 1.1em;
            display: block;
            margin-bottom: 2px;
        }
        .fc-hint-label {
            font-size: smaller;
            color: #aaa;
            margin-bottom: 2px;
        }
        .fc-choose-one-label {
            font-size: smaller;
            color: #aaa;
            margin-bottom: 2px;
            margin-top: 10px; /* Add space above to separate from hint */
        }
        .fc-warning {
            font-size: smaller;
            color: #a00;
            margin-bottom: 6px;
        }
    `;
    document.head.appendChild(style);
})();

function FCMenu() {
    Game.UpdateMenu = function () {
        if (Game.onMenu !== "fc_menu") {
            return Game.oldUpdateMenu();
        }
        if (!Game.callingMenu) {
            Game.callingMenu = true;
            setTimeout(() => {
                Game.callingMenu = false;
                Game.UpdateMenu();
            }, 1000);
        }
        var currentCookies,
            maxCookies,
            isTarget,
            isMax,
            targetTxt,
            maxTxt,
            currHC,
            resetHC,
            cps,
            baseChosen,
            frenzyChosen,
            clickStr,
            buildTable,
            bankLucky,
            bankLuckyFrenzy,
            bankChain,
            menu = $("#menu")
                .empty()
                .append(
                    $("<div>")
                        .addClass("section")
                        .text(
                            "Frozen Cookies v " +
                                FrozenCookies.branch +
                                "." +
                                FrozenCookies.version
                        )
                )
                // Add the log/info panel button
                .append(
                    $("<div>")
                        .addClass("listing")
                        .append(
                            $("<button>")
                                .attr("id", "fcOpenLogPanel")
                                .attr(
                                    "title",
                                    "Open the Cookie Clicker about/version info panel"
                                )
                                .text("Cookie Clicker Info")
                                .click(openGameLogPanel)
                        )
                )
                // Add a documentations page button
                .append(
                    $("<div>")
                        .addClass("listing")
                        .append(
                            $("<button>")
                                .attr("id", "fcOpenDocPage")
                                .attr(
                                    "title",
                                    "Open the Frozen Cookies readme/documentation page"
                                )
                                .text("Frozen Cookies Readme")
                                .click(openDocumentationPage)
                        )
                );

        // --- AUTOBUY INFO SECTION ---
        (subsection = $("<div>")
            .addClass("subsection")
            .append($("<div>").addClass("title").text("Autobuy Information"))),
            (recommendation = nextPurchase()),
            (chainRecommendation = nextChainedPurchase()),
            (isChained = !(
                recommendation.id == chainRecommendation.id &&
                recommendation.type == chainRecommendation.type
            )),
            (currentFrenzy = cpsBonus() * clickBuffBonus()),
            (bankLevel = bestBank(chainRecommendation.efficiency)),
            (actualCps =
                Game.cookiesPs +
                Game.mouseCps() *
                    FrozenCookies.cookieClickSpeed *
                    FrozenCookies.autoClick),
            (chocolateRecoup =
                (recommendation.type == "upgrade"
                    ? recommendation.cost
                    : recommendation.cost * 0.425) /
                (recommendation.delta_cps * 21));

        function buildListing(label, name) {
            return $("<div>")
                .addClass("listing")
                .append($("<b>").text(label + ":"), " ", name);
        }

        subsection.append(
            buildListing("Next Purchase", recommendation.purchase.name)
        );
        if (isChained) {
            subsection.append(
                buildListing(
                    "Building Chain to",
                    chainRecommendation.purchase.name
                )
            );
        }
        subsection.append(
            buildListing(
                "Time til completion",
                timeDisplay(
                    divCps(
                        recommendation.cost + bankLevel.cost - Game.cookies,
                        actualCps
                    )
                )
            )
        );
        if (isChained) {
            subsection.append(
                buildListing(
                    "Time til Chain completion",
                    timeDisplay(
                        divCps(
                            Math.max(
                                0,
                                chainRecommendation.cost +
                                    bankLevel.cost -
                                    Game.cookies
                            ),
                            actualCps
                        )
                    )
                )
            );
        }
        if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
            subsection.append(
                buildListing(
                    "Time to Recoup Chocolate",
                    timeDisplay(
                        divCps(
                            recommendation.cost + bankLevel.cost - Game.cookies,
                            effectiveCps()
                        ) + chocolateRecoup
                    )
                )
            );
        }
        subsection.append(buildListing("Cost", Beautify(recommendation.cost)));
        subsection.append(
            buildListing("Golden Cookie Bank", Beautify(bankLevel.cost))
        );
        subsection.append(
            buildListing("Base Δ CPS", Beautify(recommendation.base_delta_cps))
        );
        subsection.append(
            buildListing("Full Δ CPS", Beautify(recommendation.delta_cps))
        );
        subsection.append(
            buildListing(
                "Purchase Efficiency",
                Beautify(recommendation.efficiency)
            )
        );
        if (isChained) {
            subsection.append(
                buildListing(
                    "Chain Efficiency",
                    Beautify(chainRecommendation.efficiency)
                )
            );
        }
        if (bankLevel.efficiency > 0) {
            subsection.append(
                buildListing(
                    "Golden Cookie Efficiency",
                    Beautify(bankLevel.efficiency)
                )
            );
        }
        menu.append(subsection);

        // --- OPTIONS SECTION ---
        if (FrozenCookies.preferenceValues) {
            subsection = $("<div>").addClass("subsection");
            subsection.append(
                $("<div>").addClass("title").text("Frozen Cookie Controls"),
                // Add warning below the title
                $("<div>")
                    .addClass("fc-warning")
                    .text(" ⚠️ All options take effect immediately.")
            );
            _.keys(FrozenCookies.preferenceValues).forEach(function (
                preference
            ) {
                var listing,
                    prefVal = FrozenCookies.preferenceValues[preference],
                    hint = prefVal.hint,
                    display = prefVal.display,
                    extras = prefVal.extras,
                    current = FrozenCookies[preference],
                    preferenceButtonId = preference + "Button";
                if (display && display.length > 0 && display.length > current) {
                    listing = $("<div>").addClass("listing");
                    // Show hint as a subsection head before the button(s)
                    if (hint) {
                        listing.append(
                            $("<label>")
                                .addClass("fc-hint-label")
                                .text(
                                    hint.replace(
                                        /\$\{(.+)\}/g,
                                        function (s, id) {
                                            return FrozenCookies[id];
                                        }
                                    )
                                )
                        );
                    }
                    if (display.length === 2) {
                        // Render on/off option buttons side by side
                        var buttonGroup = $("<div>").addClass(
                            "fc-multichoice-group-2col"
                        );
                        display.forEach(function (label, idx) {
                            buttonGroup.append(
                                $("<button>")
                                    .addClass("option fc-multichoice-btn")
                                    .toggleClass("selected", idx === current)
                                    .prop("id", preferenceButtonId + "_" + idx)
                                    .click(function () {
                                        setPreferenceDirect(preference, idx);
                                    })
                                    .text(label)
                            );
                        });
                        listing.append(buttonGroup);
                    } else {
                        // Add "choose one" label automatically
                        listing.append(
                            $("<div>")
                                .addClass("fc-choose-one-label")
                                .text("Choose one:")
                        );
                        // Determine column class based on number of options
                        let groupClass = "fc-multichoice-group-vertical";
                        if (display.length > 8) {
                            groupClass = "fc-multichoice-group-3col";
                        } else if (display.length > 4) {
                            groupClass = "fc-multichoice-group-2col";
                        }
                        // Render a group of buttons for direct selection, stacked or in columns
                        var buttonGroup = $("<div>").addClass(groupClass);
                        display.forEach(function (label, idx) {
                            buttonGroup.append(
                                $("<button>")
                                    .addClass("option fc-multichoice-btn")
                                    .toggleClass("selected", idx === current)
                                    .prop("id", preferenceButtonId + "_" + idx)
                                    .click(function () {
                                        setPreferenceDirect(preference, idx);
                                    })
                                    .text(label)
                            );
                        });
                        listing.append(buttonGroup);
                    }
                    if (extras) {
                        // If extras is a function, call it with FrozenCookies, else treat as string
                        var extrasHtml =
                            typeof extras === "function"
                                ? extras(FrozenCookies)
                                : extras.replace(
                                      /\$\{(.+)\}/g,
                                      function (s, id) {
                                          return fcBeautify(FrozenCookies[id]);
                                      }
                                  );
                        listing.append($(extrasHtml));
                    }
                    subsection.append(listing);
                }
                // if no options, still display the hint as a subsection head
                if (!display) {
                    listing = $("<div>").addClass("fc-section-heading");
                    if (hint) {
                        listing.append(
                            $("<br>"),
                            $("<label>").text(
                                hint.replace(/\$\{(.+)\}/g, function (s, id) {
                                    return FrozenCookies[id];
                                })
                            )
                        );
                    }
                    subsection.append(listing);
                }
            });
            menu.append(subsection);
        }

        // --- GOLDEN COOKIE INFO SECTION ---
        subsection = $("<div>").addClass("subsection");
        subsection.append(
            $("<div>").addClass("title").text("Golden Cookie Information")
        );
        currentCookies = Math.min(Game.cookies, FrozenCookies.targetBank.cost);
        maxCookies = bestBank(Number.POSITIVE_INFINITY).cost;
        isTarget =
            FrozenCookies.targetBank.cost == FrozenCookies.currentBank.cost;
        isMax = currentCookies == maxCookies;
        targetTxt = isTarget ? "" : " (Building Bank)";
        maxTxt = isMax ? " (Max)" : "";
        subsection.append(
            buildListing("Current Frenzy", Beautify(currentFrenzy))
        );
        subsection.append(
            buildListing(
                "Current Average Cookie Value" + targetTxt + maxTxt,
                Beautify(cookieValue(currentCookies))
            )
        );
        if (!isTarget) {
            subsection.append(
                buildListing(
                    "Target Average Cookie Value",
                    Beautify(cookieValue(FrozenCookies.targetBank.cost))
                )
            );
        }
        if (!isMax) {
            subsection.append(
                buildListing(
                    "Max Average Cookie Value",
                    Beautify(cookieValue(maxCookies))
                )
            );
        }
        subsection.append(
            buildListing("Max Lucky Cookie Value", Beautify(maxLuckyValue()))
        );
        subsection.append(
            buildListing(
                "Cookie Bank Required for Max Lucky",
                Beautify(maxLuckyValue() * 10)
            )
        );
        subsection.append(
            buildListing(
                "Max Chain Cookie Value",
                Beautify(
                    calculateChainValue(
                        chainBank(),
                        Game.cookiesPs,
                        7 - Game.elderWrath / 3
                    )
                )
            )
        );
        subsection.append(
            buildListing(
                "Cookie Bank Required for Max Chain",
                Beautify(chainBank())
            )
        );
        subsection.append(
            buildListing(
                "Estimated Cookie CPS",
                Beautify(gcPs(cookieValue(currentCookies)))
            )
        );
        subsection.append(
            buildListing("Golden Cookie Clicks", Beautify(Game.goldenClicks))
        );
        if (FrozenCookies.showMissedCookies == 1) {
            subsection.append(
                buildListing(
                    "Missed Golden Cookie Clicks",
                    Beautify(Game.missedGoldenClicks)
                )
            );
        }
        subsection.append(
            buildListing(
                "Last Golden Cookie Effect",
                Game.shimmerTypes.golden.last
            )
        );
        menu.append(subsection);

        // --- FRENZY TIMES SECTION ---
        subsection = $("<div>").addClass("subsection");
        subsection.append($("<div>").addClass("title").text("Frenzy Times"));
        $.each(
            Object.keys(FrozenCookies.frenzyTimes)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .reduce((result, rate) => {
                    result[parseInt(rate)] =
                        (result[parseInt(rate)] || 0) +
                        FrozenCookies.frenzyTimes[rate];
                    return result;
                }, {}),
            (rate, time) => {
                subsection.append(
                    buildListing(
                        "Total Recorded Time at x" + Beautify(rate),
                        timeDisplay(time / 1000)
                    )
                );
            }
        );
        menu.append(subsection);

        // --- HEAVENLY CHIPS INFO SECTION ---
        subsection = $("<div>").addClass("subsection");
        subsection.append(
            $("<div>").addClass("title").text("Heavenly Chips Information")
        );
        currHC = Game.heavenlyChips;
        resetHC = Game.HowMuchPrestige(
            Game.cookiesReset +
                Game.cookiesEarned +
                wrinklerValue() +
                chocolateValue()
        );

        // Show timing if it's been more than a minute since the last HC was gained
        var showTiming = Date.now() - FrozenCookies.lastHCTime > 1000 * 60;
        subsection.append(buildListing("HC Now", Beautify(Game.heavenlyChips)));
        subsection.append(buildListing("HC After Reset", Beautify(resetHC)));
        if (showTiming) {
            subsection.append(
                buildListing("Estimated time to next HC", nextHC())
            );
        }
        if (currHC < resetHC) {
            if (showTiming) {
                subsection.append(
                    buildListing(
                        "Time since last HC",
                        timeDisplay(
                            (Date.now() - FrozenCookies.lastHCTime) / 1000
                        )
                    )
                );
                if (FrozenCookies.lastHCAmount - 1 >= currHC) {
                    subsection.append(
                        buildListing(
                            "Time to get last HC",
                            timeDisplay(
                                (FrozenCookies.lastHCTime -
                                    FrozenCookies.prevLastHCTime) /
                                    1000
                            )
                        )
                    );
                }
            }
            if (FrozenCookies.maxHCPercent > 0) {
                subsection.append(
                    buildListing(
                        "Max HC Gain/hr",
                        Beautify(FrozenCookies.maxHCPercent)
                    )
                );
            }
            subsection.append(
                buildListing(
                    "Average HC Gain/hr",
                    Beautify(
                        (60 * 60 * (FrozenCookies.lastHCAmount - currHC)) /
                            ((FrozenCookies.lastHCTime - Game.startDate) / 1000)
                    )
                )
            );
            if (showTiming && FrozenCookies.lastHCAmount - 1 >= currHC) {
                subsection.append(
                    buildListing(
                        "Previous Average HC Gain/hr",
                        Beautify(
                            (60 *
                                60 *
                                (FrozenCookies.lastHCAmount - 1 - currHC)) /
                                ((FrozenCookies.prevLastHCTime -
                                    Game.startDate) /
                                    1000)
                        )
                    )
                );
            }
        }
        menu.append(subsection);

        // --- HARVESTING (BANK) INFO SECTION ---
        if (FrozenCookies.setHarvestBankPlant) {
            subsection = $("<div>").addClass("subsection");
            subsection.append(
                $("<div>").addClass("title").text("Harvesting Information")
            );
            subsection.append(buildListing("Base CPS", Beautify(baseCps())));
            subsection.append(
                buildListing("Plant to harvest", FrozenCookies.harvestPlant)
            );
            subsection.append(
                buildListing(
                    "Minutes of CpS",
                    FrozenCookies.harvestMinutes + " min"
                )
            );
            subsection.append(
                buildListing(
                    "Max percent of Bank",
                    FrozenCookies.harvestMaxPercent * 100 + " %"
                )
            );
            subsection.append(
                buildListing(
                    "Single " +
                        FrozenCookies.harvestPlant +
                        (FrozenCookies.setHarvestBankPlant < 6
                            ? " harvesting"
                            : " exploding") +
                        "",
                    Beautify(
                        (baseCps() *
                            60 *
                            FrozenCookies.harvestMinutes *
                            FrozenCookies.harvestFrenzy *
                            FrozenCookies.harvestBuilding) /
                            Math.pow(10, FrozenCookies.maxSpecials)
                    )
                )
            );
            subsection.append(
                buildListing(
                    "Full garden " +
                        (FrozenCookies.setHarvestBankPlant < 6
                            ? " harvesting"
                            : " exploding") +
                        " (36 plots)",
                    Beautify(
                        (36 *
                            baseCps() *
                            60 *
                            FrozenCookies.harvestMinutes *
                            FrozenCookies.harvestFrenzy *
                            FrozenCookies.harvestBuilding) /
                            Math.pow(10, FrozenCookies.maxSpecials)
                    )
                )
            );
            menu.append(subsection);
        }

        // --- OTHER INFO SECTION ---
        subsection = $("<div>").addClass("subsection");
        subsection.append(
            $("<div>").addClass("title").html("Other Information")
        );
        cps =
            baseCps() +
            baseClickingCps(
                FrozenCookies.cookieClickSpeed * FrozenCookies.autoClick
            );
        baseChosen = Game.hasBuff("Frenzy") ? "" : " (*)";
        frenzyChosen = Game.hasBuff("Frenzy") ? " (*)" : "";
        clickStr = FrozenCookies.autoClick ? " + Autoclick" : "";
        subsection.append(
            buildListing("Base CPS" + clickStr + baseChosen + "", Beautify(cps))
        );
        subsection.append(
            buildListing(
                "Frenzy CPS" + clickStr + frenzyChosen + "",
                Beautify(cps * 7)
            )
        );
        subsection.append(
            buildListing("Estimated Effective CPS", Beautify(effectiveCps()))
        );
        if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
            subsection.append(
                buildListing("Chocolate Egg Value", Beautify(chocolateValue()))
            );
            if (!Game.hasAura("Earth Shatterer")) {
                subsection.append(
                    buildListing(
                        "+ Earth Shatterer",
                        Beautify(chocolateValue(null, true))
                    )
                );
            }
        }
        if (liveWrinklers().length > 0) {
            subsection.append(
                buildListing("Wrinkler Value", Beautify(wrinklerValue()))
            );
        }
        subsection.append(buildListing("Game Seed", Game.seed));
        menu.append(subsection);
        // --- INTERNAL INFO SECTION ---
        subsection = $("<div>").addClass("subsection");
        subsection.append(
            $("<div>").addClass("title").text("Internal Information")
        );
        buildTable = $("<table>")
            .prop("id", "fcEfficiencyTable")
            .append(
                $("<tr>").append(
                    $("<th>").text("Building"),
                    $("<th>").text("Eff%"),
                    $("<th>").text("Efficiency"),
                    $("<th>").text("Cost"),
                    $("<th>").text("Δ CPS")
                )
            );
        recommendationList().forEach(function (rec) {
            var item = rec.purchase,
                chainStr = item.unlocked === 0 ? " (C)" : "";
            buildTable.append(
                $("<tr>").append(
                    $("<td>").append($("<b>").text(item.name + chainStr)),
                    $("<td>").text(
                        (
                            Math.floor(rec.efficiencyScore * 10000) / 100
                        ).toString() + "%"
                    ),
                    $("<td>").text(Beautify(rec.efficiency)),
                    $("<td>").text(Beautify(rec.cost)),
                    $("<td>").text(Beautify(rec.delta_cps))
                )
            );
        });

        // Table Dividers
        var dividers = [
            $("<tr>").append($("<td>").attr("colspan", "5").html("&nbsp;")),
            $("<tr>")
                .css("border-top", "2px dashed #999")
                .append($("<td>").attr("colspan", "5").html("&nbsp;")),
        ];

        var banks = [
            {
                name: "Lucky Bank",
                cost: luckyBank(),
                efficiency: cookieEfficiency(Game.cookies, luckyBank()),
            },
            {
                name: "Lucky Frenzy Bank",
                cost: luckyFrenzyBank(),
                efficiency: cookieEfficiency(Game.cookies, luckyFrenzyBank()),
            },
            {
                name: "Chain Bank",
                cost: chainBank(),
                efficiency: cookieEfficiency(Game.cookies, chainBank()),
            },
        ];

        var elderWrathLevels = [
            {
                name: "Pledging/Appeased",
                level: 0,
            },
            {
                name: "One Mind/Awoken",
                level: 1,
            },
            {
                name: "Displeased",
                level: 2,
            },
            {
                name: "Full Wrath/Angered",
                level: 3,
            },
        ];
        buildTable.append(dividers);
        banks.forEach(function (bank) {
            var deltaCps = effectiveCps(bank.cost) - effectiveCps();
            buildTable.append(
                $("<tr>").append(
                    $("<td>")
                        .attr("colspan", "2")
                        .append(
                            $("<b>").text(
                                bank.name + (bank.deltaCps === 0 ? " (*)" : "")
                            )
                        ),
                    $("<td>").text(Beautify(bank.efficiency)),
                    $("<td>").text(
                        Beautify(Math.max(0, bank.cost - Game.cookies))
                    ),
                    $("<td>").text(Beautify(deltaCps))
                )
            );
        });

        buildTable.append(dividers);
        elderWrathLevels.forEach(function (wrath) {
            buildTable.append(
                $("<tr>").append(
                    $("<td>")
                        .attr("colspan", "2")
                        .append(
                            $("<b>").text(
                                wrath.name +
                                    (Game.elderWrath === wrath.level
                                        ? " (*)"
                                        : "")
                            )
                        ),
                    $("<td>")
                        .attr("colspan", "2")
                        .attr("title", "Ratio of Effective CPS vs Base CPS")
                        .text(
                            Beautify(
                                effectiveCps(Game.cookies, wrath.level) /
                                    baseCps()
                            )
                        ),
                    $("<td>").text(
                        Beautify(
                            effectiveCps(Game.cookies, wrath.level) -
                                effectiveCps()
                        )
                    )
                )
            );
        });
        subsection.append($("<div>").addClass("listing").append(buildTable));
        menu.append(subsection);

        if (!Game.HasAchiev("Olden days"))
            subsection.append(
                $(
                    '<div id="oldenDays" style="text-align:right;width:100%;"><div ' +
                        Game.clickStr +
                        "=\"Game.SparkleAt(Game.mouseX,Game.mouseY);PlaySound('snd/tick.mp3');PlaySound('snd/shimmerClick.mp3');Game.Win('Olden days');Game.UpdateMenu();\" class=\"icon\" style=\"display:inline-block;transform:scale(0.5);cursor:pointer;width:48px;height:48px;background-position:" +
                        -12 * 48 +
                        "px " +
                        -3 * 48 +
                        'px;"></div></div>'
                )
            );
    };
}

// Cycle through the preference values for a given option.
function cyclePreference(preferenceName) {
    var preference = FrozenCookies.preferenceValues[preferenceName];
    if (preference) {
        var display = preference.display;
        var current = FrozenCookies[preferenceName];
        var preferenceButton = $("#" + preferenceName + "Button");
        if (
            display &&
            display.length > 0 &&
            preferenceButton &&
            preferenceButton.length > 0
        ) {
            var newValue = (current + 1) % display.length;
            preferenceButton[0].innerText = display[newValue];
            FrozenCookies[preferenceName] = newValue;
            FrozenCookies.recalculateCaches = true;
            Game.RefreshStore();
            Game.RebuildUpgrades();
            FCStart();
        }
    }
}

// New function for multiple choice options
function setPreferenceDirect(preferenceName, value) {
    var preference = FrozenCookies.preferenceValues[preferenceName];
    if (preference) {
        FrozenCookies[preferenceName] = value;
        FrozenCookies.recalculateCaches = true;
        Game.RefreshStore();
        Game.RebuildUpgrades();
        FCStart();
    }
}

// Opens the built-in Cookie Clicker log/info panel.
function openGameLogPanel() {
    Game.ShowMenu("log");
}

// Opens the Frozen Cookies online documentation page.
// Note: Modern browsers restrict window.open to only open new tabs or windows as per user settings.
// There is no reliable, cross-browser way to force a new browser instance from JavaScript due to security restrictions.
// The following will open a new window (which may be a tab, depending on browser settings).
function openDocumentationPage() {
    window.open(
        "https://github.com/erbkaiser/FrozenCookies?tab=readme-ov-file#frozencookies",
        "_blank",
        "noopener,noreferrer,width=800,height=600"
    );
}
