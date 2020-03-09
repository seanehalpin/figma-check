setTimeout(function () {
    function runPlugin() {
        let nodes = figma.currentPage.selection;
        let arrayError = [];
        let arrayIssue = [];
        // error holder arrays
        let arrayMasterComponent = [];
        let arrayUniqueName = [];
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
        let arrayNodeParents = [];
        let arrayFoundStoryBook = [];
        let arrayStorykBookNameMissing = [];
        let arrayStoryAvatar = [];
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
            for (const node of nodes) {
                if (node.type === 'COMPONENT') {
                    // show UI
                    figma.showUI(__html__, { width: 380, height: 535 });
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
                    // unique name checker
                    searchAll.forEach(item => {
                        if (item.type === 'COMPONENT') {
                            if (item.name === node.name) {
                                arrayUniqueName.push(item.name);
                            }
                        }
                    });
                    const uniqueNameLength = arrayUniqueName.length;
                    if (uniqueNameLength >= 2) {
                        arrayError.push("Duplicate name");
                        arrayUniqueNameCheck.push(node.name);
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
                            if (child.type === 'TEXT') {
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
                                    arrayError.push("Missing global text style: " + child.name);
                                    arrayFontStyle.push(child.name);
                                    figma.ui.postMessage({
                                        'troubleFound': true
                                    });
                                }
                            }
                            // lorem checker
                            if (child.type === 'TEXT') {
                                // console.log("text")
                                if (child.chararcters === 'Lorem' ||
                                    child.chararcters === 'Lorem' ||
                                    child.chararcters === 'ipsum' ||
                                    child.chararcters === 'Lorem ipsum') {
                                    console.log("lorem ipsum found");
                                }
                            }
                            // frame checker
                            if (child.type === 'FRAME' && child.layoutMode === 'NONE') {
                                arrayIssue.push("Nested Frame: " + child.name);
                                arrayFrameCheck.push(child.name);
                                console.log(child.layoutMode);
                                figma.ui.postMessage({
                                    'troubleFound': true
                                });
                            }
                            if (child.type === 'RECTANGLE' ||
                                child.type === 'ELLIPSE' ||
                                child.type === 'POLYGON' ||
                                child.type === 'VECTOR' ||
                                child.type === 'STAR') {
                                // fill global style checker
                                const hasStyle = child.fillStyleId;
                                const hasStyleLength = hasStyle.length;
                                if (hasStyleLength === 0) {
                                    arrayError.push("Missing global fill style: " + child.name);
                                    arrayFillCheck.push(child.name);
                                    figma.ui.postMessage({
                                        'troubleFound': true
                                    });
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
                                        if (child.strokeStyleId !== 'S:c05320048b3a7741141210c055090c0aa4499e1b,874:20' ||
                                            child.strokeStyleId !== 'S:1e185f3fefaee1d886726255a6e2275edd35df85,32:23' ||
                                            child.strokeStyleId !== 'S:710b40726a4ac51bcfb30d733c9b25a887ffdc92,874:13') {
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
                            // hidden layer checker
                            if (child.visible !== true || child.opacity === 0) {
                                arrayHidden.push(child.name);
                                arrayIssue.push(child.name);
                                figma.ui.postMessage({
                                    'troubleFound': true
                                });
                            }
                            if ("children" in child)
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
                        'arrayStoryAvatar': arrayStoryAvatar
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
