setTimeout(function () {
    function runPlugin() {
        let nodes = figma.currentPage.selection;
        let frames = figma.currentPage.children.filter((node) => node.type === 'FRAME');
        // error type holders
        let arrayError = [];
        let arrayIssue = [];
        // error holder arrays
        let arrayMasterComponent = [];
        let arrayWrongFont = [];
        let arrayNoDesc = [];
        let arrayUniqueNameCheck = [];
        let arrayNoInstance = [];
        let arrayFontStyle = [];
        let arrayFrameCheck = [];
        let arrayFillCheck = [];
        let arrayBorderCheck = [];
        let arrayHidden = [];
        let arrayShadow = [];
        let arrayStrokeGrey = [];
        let arrayStrokeTwo = [];
        let arrayFontStyleMixed = [];
        let arrayUniqueFrameName = [];
        let arrayFrameDup = [];
        let arrayIpsumFound = [];
        let arrayNodeParents = [];
        let arrayFoundStoryBook = [];
        let arrayStorykBookNameMissing = [];
        let arrayStoryAvatar = [];
        let arrayScale = [];
        const scale = { horizontal: "SCALE", vertical: "SCALE" };
        const scaleString = JSON.stringify(scale);
        function checkIfArrayIsUnique(myArray) {
            return myArray.length === new Set(myArray).size;
        }
        function errorMsg() {
            figma.showUI(__html__, { width: 380, height: 535 });
            figma.ui.postMessage({
                'noComponent': true
            });
        }
        if (nodes.length === 0) {
            // nothing selected, show error
            errorMsg();
        }
        else {
            for (const frame of frames) {
                arrayUniqueFrameName.push(frame.name);
            }
            for (const node of nodes) {
                if (node.type === 'COMPONENT') {
                    // show UI
                    figma.showUI(__html__, { width: 380, height: 535 });
                    // Dup frame checker
                    let UniqueFrame = checkIfArrayIsUnique(arrayUniqueFrameName);
                    // console.log(UniqueFrame)
                    if (UniqueFrame === false) {
                        arrayError.push("Dupe frame name");
                        arrayFrameDup.push("found");
                        figma.ui.postMessage({
                            'troubleFound': true
                        });
                    }
                    // instance checker
                    const searchAll = figma.root.findAll();
                    searchAll.forEach(item => {
                        if (item.type === 'INSTANCE' && item.masterComponent === node) {
                            arrayMasterComponent.push(1);
                        }
                    });
                    if (arrayMasterComponent.length === 0) {
                        arrayError.push("No instance");
                        arrayNoInstance.push("component");
                        figma.ui.postMessage({
                            'noFoundInstance': true,
                            'troubleFound': true
                        });
                    }
                    // check what the parent frame is
                    const frameParent = node.parent;
                    function storyBookCheck(item) {
                        arrayNodeParents.push(item);
                        arrayNodeParents.forEach(element => {
                            element.children.forEach(child => {
                                if (child.name === "StoryBook Name") {
                                    arrayFoundStoryBook.push(1);
                                    child.children.forEach(granchild => {
                                        if (granchild.name === 'Avatar' && granchild.visible !== true) {
                                            arrayError.push("Missing Avatar");
                                            arrayStoryAvatar.push("missing");
                                            figma.ui.postMessage({
                                                'troubleFound': true
                                            });
                                        }
                                        if (granchild.name === 'Avatar') {
                                            if (granchild.visible === true && granchild.children.visible !== true) {
                                                granchild.children.forEach(newchild => {
                                                    if (newchild.name === 'Ellipse' && newchild.visible === 'false') {
                                                        arrayError.push("Missing Avatar");
                                                        arrayStoryAvatar.push("missing");
                                                        figma.ui.postMessage({
                                                            'troubleFound': true
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    }
                    if (frameParent.type === 'GROUP') {
                        const groupParent = frameParent.parent;
                        storyBookCheck(groupParent);
                    }
                    else {
                        storyBookCheck(frameParent);
                    }
                    // console.log(arrayFoundStoryBook.length)
                    if (arrayFoundStoryBook.length === 0) {
                        arrayError.push("Missing Storybook Name");
                        arrayStorykBookNameMissing.push("missing");
                        figma.ui.postMessage({
                            'troubleFound': true
                        });
                    }
                    // component desc checker
                    const descriptionLength = node.description.length;
                    if (descriptionLength === 0) {
                        arrayIssue.push("No component description");
                        arrayNoDesc.push("description");
                        figma.ui.postMessage({
                            'troubleFound': true
                        });
                    }
                    function componentChildren(children) {
                        children.forEach(child => {
                            if (child.type === 'TEXT' && child.fontName !== figma.mixed) {
                                // font family checker
                                if (child.fontName.family != "Roboto"
                                    && child.fontName.family != "Aktiv Grotesk"
                                    && child.fontName.family != "San Francisco"
                                    && child.fontName.family != "San Francisco Text"
                                    && child.fontName.family != "SF Pro Text") {
                                    arrayError.push(child.fontName.family);
                                    arrayWrongFont.push(child.fontName.family);
                                    figma.ui.postMessage({
                                        'troubleFound': true
                                    });
                                }
                                // text global style checker
                                const hasStyle = child.textStyleId;
                                const hasStyleLength = hasStyle.length;
                                if (hasStyleLength === 0) {
                                    arrayIssue.push("Missing global text style: " + child.name);
                                    arrayFontStyle.push(child.name);
                                    figma.ui.postMessage({
                                        'troubleFound': true
                                    });
                                }
                            }
                            if (child.type === 'TEXT' && child.fontName === figma.mixed) {
                                arrayError.push("Font styles are mixed on layer " + child.name);
                                arrayFontStyleMixed.push(child.name);
                                figma.ui.postMessage({
                                    'troubleFound': true
                                });
                            }
                            // lorem checker
                            let arrayLorem = [];
                            let loremText = "ipsum";
                            if (child.type === 'TEXT') {
                                arrayLorem.push(child.characters);
                                JSON.stringify(arrayLorem);
                                let joined = arrayLorem.join();
                                // console.log(joined)
                                if (joined.indexOf(loremText) !== -1) {
                                    arrayIpsumFound.push("found");
                                    figma.ui.postMessage({
                                        'troubleFound': true
                                    });
                                }
                            }
                            // scale checker
                            let childConstraints = child.constraints;
                            let childConstraintsString = JSON.stringify(childConstraints);
                            if (child.layoutMode === "NONE") {
                                if (childConstraintsString === scaleString) {
                                    if (child.name === "fill" || child.name === "Fill" || child.name === "Vector" || child.name === "vector") {
                                        // console.log(child.name)
                                    }
                                    else {
                                        let thisParent = child.parent;
                                        if (thisParent.type !== 'GROUP') {
                                            console.log("parent isnt a group, child: " + child.name + ", parent: " + thisParent.name);
                                            arrayIssue.push("Scaling found: " + child.name);
                                            arrayScale.push(child.name);
                                            figma.ui.postMessage({
                                                'troubleFound': true
                                            });
                                        }
                                    }
                                }
                            }
                            // frame checker
                            if (child.type === 'FRAME' && child.layoutMode === 'NONE') {
                                arrayIssue.push("Nested Frame: " + child.name);
                                arrayFrameCheck.push(child.name);
                                // console.log(child.layoutMode)
                                figma.ui.postMessage({
                                    'troubleFound': true
                                });
                            }
                            if (child.type === 'RECTANGLE' ||
                                child.type === 'ELLIPSE' ||
                                child.type === 'POLYGON' ||
                                child.type === 'VECTOR' ||
                                child.type === 'STAR') {
                                if (child.name !== "Vector") {
                                    // fill global style checker
                                    const hasStyle = child.fillStyleId;
                                    const hasStyleLength = hasStyle.length;
                                    const hasFills = child.fills;
                                    const hasFillsLength = hasFills.length;
                                    if (hasStyleLength === 0) {
                                        if (hasFillsLength !== 0) {
                                            arrayError.push("Missing global fill style: " + child.name);
                                            arrayFillCheck.push(child.name);
                                            figma.ui.postMessage({
                                                'troubleFound': true
                                            });
                                        }
                                    }
                                    //  stroke checkers
                                    const strokeAttached = child.strokes;
                                    const strokeAttachedLength = strokeAttached.length;
                                    if (strokeAttachedLength === 1) {
                                        // outside stroke checker
                                        if (child.strokeAlign === 'CENTER' || child.strokeAlign === 'INSIDE') {
                                            arrayIssue.push("Stroke not outside: " + child.name);
                                            arrayBorderCheck.push(child.name);
                                            figma.ui.postMessage({
                                                'troubleFound': true
                                            });
                                        }
                                        // style grey 600 1px checker
                                        if (child.strokeWeight === 1) {
                                            if (child.strokeStyleId !== 'S:c05320048b3a7741141210c055090c0aa4499e1b,874:20') {
                                                arrayIssue.push("stroke not grey 600: " + child.name);
                                                arrayStrokeGrey.push(child.name);
                                                figma.ui.postMessage({
                                                    'troubleFound': true
                                                });
                                            }
                                        }
                                        // style 2px checker
                                        if (child.strokeWeight === 2) {
                                            if (child.strokeStyleId !== "S:eeccee1f35c1a51c6f83db293c745e39361d66f5,5:52" &&
                                                child.strokeStyleId !== "S:1e185f3fefaee1d886726255a6e2275edd35df85,32:23" &&
                                                child.strokeStyleId !== "S:710b40726a4ac51bcfb30d733c9b25a887ffdc92,874:13") {
                                                // console.log(child.strokeStyleId)
                                                arrayIssue.push("2px stroke not right: " + child.name);
                                                arrayStrokeTwo.push(child.name);
                                                // console.log("2px stroke wrong " + child.name)
                                                figma.ui.postMessage({
                                                    'troubleFound': true
                                                });
                                            }
                                        }
                                    }
                                    // text global style checker
                                    const hasEffects = child.effects;
                                    const hasEffectsLength = hasEffects.length;
                                    const hasEffectsId = child.effectStyleId;
                                    const hasEffectsIdLength = hasEffectsId.length;
                                    if (hasEffectsLength !== 0) {
                                        if (hasEffectsIdLength === 0) {
                                            arrayIssue.push(child.name);
                                            arrayShadow.push(child.name);
                                            figma.ui.postMessage({
                                                'troubleFound': true
                                            });
                                        }
                                    }
                                }
                            }
                            // hidden layer checker
                            if (child.visible !== true || child.opacity === 0) {
                                arrayHidden.push(child.name);
                                arrayIssue.push(child.name);
                                figma.ui.postMessage({
                                    'troubleFound': true
                                });
                            }
                            if ("children" in child && child.type !== "BOOLEAN_OPERATION")
                                componentChildren(child.children);
                        });
                    }
                    componentChildren(nodes);
                    const arrayErrorLength = arrayError.length;
                    const arrayIssueLength = arrayIssue.length;
                    arrayWrongFont.reverse();
                    arrayFillCheck.reverse();
                    arrayBorderCheck.reverse();
                    arrayHidden.reverse();
                    arrayFontStyle.reverse();
                    arrayShadow.reverse();
                    arrayStrokeGrey.reverse();
                    arrayStrokeTwo.reverse();
                    arrayFontStyleMixed.reverse();
                    arrayScale.reverse();
                    figma.ui.postMessage({
                        'errorLength': arrayErrorLength,
                        'issueLength': arrayIssueLength,
                        'arrayWrongFont': arrayWrongFont,
                        'arrayDescMissing': arrayNoDesc,
                        'arrayUniqueNameCheck': arrayUniqueNameCheck,
                        'arrayNoInstance': arrayNoInstance,
                        'arrayFontStyle': arrayFontStyle,
                        'arrayFrameCheck': arrayFrameCheck,
                        'arrayFillCheck': arrayFillCheck,
                        'arrayBorderCheck': arrayBorderCheck,
                        'arrayHidden': arrayHidden,
                        'arrayShadow': arrayShadow,
                        'arrayStrokeGrey': arrayStrokeGrey,
                        'arrayStrokeTwo': arrayStrokeTwo,
                        'arrayStorykBookNameMissing': arrayStorykBookNameMissing,
                        'arrayStoryAvatar': arrayStoryAvatar,
                        'arrayFontStyleMixed': arrayFontStyleMixed,
                        'arrayFrameDup': arrayFrameDup,
                        'arrayIpsumFound': arrayIpsumFound,
                        'arrayScale': arrayScale
                    });
                }
                else {
                    errorMsg();
                } // end if component
            } // end for
        } // end else
    } // end function
    runPlugin();
    figma.ui.onmessage = msg => {
        if (msg.type === 'recheck') {
            runPlugin();
        }
    };
}, 100);
