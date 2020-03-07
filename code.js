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
        function errorMsg() {
            figma.closePlugin('⚠️ Please select a master component ⚠️');
        }
        if (nodes.length === 0) {
            // nothing selected, show error
            errorMsg();
        }
        else {
            for (const node of nodes) {
                if (node.type === 'COMPONENT') {
                    // show UI
                    figma.showUI(__html__, { width: 380, height: 555 });
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
                            'badName': true,
                            'badNameFound': node.name,
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
                                        'badFont': true,
                                        'badFontType': child.fontName.family,
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
                                        'badFontStyle': true,
                                        'badFontStyleType': child.name,
                                        'troubleFound': true
                                    });
                                }
                            }
                            // frame checker
                            if (child.type === 'FRAME') {
                                arrayIssue.push("Nested Frame: " + child.name);
                                arrayFrameCheck.push(child.name);
                                figma.ui.postMessage({
                                    'badFrame': true,
                                    'badFrameName': child.name,
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
                                    console.log(arrayError);
                                    arrayFillCheck.push(child.name);
                                    figma.ui.postMessage({
                                        'badFill': true,
                                        'badFillLayer': child.name,
                                        'troubleFound': true
                                    });
                                }
                                // outside stroke checker
                                const strokeAttached = child.strokes;
                                const strokeAttachedLength = strokeAttached.length;
                                if (strokeAttachedLength === 1) {
                                    if (child.strokeAlign === 'CENTER' || child.strokeAlign === 'INSIDE') {
                                        arrayIssue.push("Stroke not outside: " + child.name);
                                        arrayBorderCheck.push(child.name);
                                        figma.ui.postMessage({
                                            'badStroke': true,
                                            'badStrokeLayer': child.name,
                                            'troubleFound': true
                                        });
                                    }
                                }
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
                        'arrayBorderCheck': arrayBorderCheck
                    });
                } // end if component
            } // end loop through
        } // end else
    } // end function
    runPlugin();
    figma.ui.onmessage = msg => {
        if (msg.type === 'recheck') {
            runPlugin();
        }
    };
}, 100);
