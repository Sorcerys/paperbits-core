﻿import * as ko from "knockout";
import * as Html from "@paperbits/common/html";
import { Keys } from "@paperbits/common/keyboard";
import { View } from "@paperbits/common/ui";
import { BalloonOptions, BalloonActivationOptions, BalloonHandle } from "@paperbits/common/ui/balloons";
import { ViewStack } from "@paperbits/common/ui/viewStack";
import { Events } from "@paperbits/common/events";


enum BalloonState {
    opening = "opening",
    open = "open",
    closing = "closing",
    closed = "closed"
}

export class BalloonBindingHandler {
    constructor(viewStack: ViewStack) {
        ko.bindingHandlers["balloon"] = {
            init: (toggleElement: HTMLElement, valueAccessor: () => BalloonOptions) => {
                const options = ko.unwrap(valueAccessor());
                const activateOn = options.activateOn || BalloonActivationOptions.clickOrKeyDown;

                let inBalloon = false;
                let isHoverOver = false;
                let balloonView: View;
                let balloonElement: HTMLElement;
                let balloonTipElement: HTMLElement;
                let balloonState = BalloonState.closed;
                let closeTimeout;
                let createBalloonElement: () => void;

                if (options.component) {
                    createBalloonElement = () => {
                        balloonElement = document.createElement("div");
                        balloonElement.classList.add("balloon");
                        ko.applyBindingsToNode(balloonElement, { component: options.component, dialog: {} }, null);
                        document.body.appendChild(balloonElement);
                    };
                }

                if (options.template) {
                    createBalloonElement = () => {
                        balloonElement = document.createElement("div");
                        balloonElement.classList.add("balloon");
                        ko.applyBindingsToNode(balloonElement, { template: options.template, dialog: {} }, null);
                        document.body.appendChild(balloonElement);
                    };
                }

                if (activateOn === BalloonActivationOptions.clickOrKeyDown) {
                    toggleElement.setAttribute(Html.AriaAttributes.expanded, "false");
                }

                const createBalloonTip = (): void => {
                    balloonTipElement = document.createElement("div");
                    balloonTipElement.classList.add("balloon-tip");
                    document.body.appendChild(balloonTipElement);
                };

                const removeBalloon = (): void => {
                    balloonState = BalloonState.closed;

                    if (!balloonElement) {
                        return;
                    }

                    delete toggleElement["activeBalloon"];
                    ko.cleanNode(balloonElement);
                    balloonElement.remove();
                    balloonElement = null;
                    balloonTipElement.remove();
                    balloonTipElement = null;

                    viewStack.removeView(balloonView);
                };

                const resetCloseTimeout = () => {
                    if (options.closeTimeout) {
                        clearTimeout(closeTimeout);
                        balloonState = BalloonState.closing;
                        closeTimeout = setTimeout(closeBalloon, options.closeTimeout);
                    }
                };

                const updatePosition = async (): Promise<void> => {
                    if (!balloonElement || !BalloonState.open) {
                        return;
                    }

                    const preferredPosition = options.position;
                    const preferredDirection = preferredPosition === "left" || preferredPosition === "right"
                        ? "horizontal"
                        : "vertical";

                    const triggerRect = toggleElement.getBoundingClientRect();
                    const balloonRect = balloonElement.getBoundingClientRect();
                    const spaceTop = triggerRect.top;
                    const spaceBottom = window.innerHeight - triggerRect.bottom;
                    const spaceLeft = triggerRect.left;
                    const spaceRight = window.innerWidth - triggerRect.height;

                    const balloonTipSize = 10;
                    const egdeGap = 10;
                    const padding = 10;

                    let balloonLeft: number;
                    let balloonRight: number;
                    let balloonTop: number;
                    let balloonBottom: number;
                    let selectedPosition: string;

                    let positionX: string;
                    let positionY: string;
                    let availableSpaceX: number;
                    let availableSpaceY: number;
                    let balloonHeight: number = balloonRect.height;
                    let balloonWidth: number = balloonRect.width;

                    let balloonTipX: number;
                    let balloonTipY: number;

                    if (preferredDirection === "vertical") {
                        if (spaceTop > spaceBottom) {
                            positionY = "top";
                            availableSpaceY = spaceTop - egdeGap - padding;
                        }
                        else {
                            positionY = "bottom";
                            availableSpaceY = spaceBottom - egdeGap - padding;
                        }
                    }
                    else {
                        if (spaceLeft > spaceRight) {
                            positionX = "left";
                            availableSpaceX = spaceLeft - egdeGap;
                            availableSpaceY = window.innerHeight - egdeGap - padding;
                        }
                        else {
                            positionX = "right";
                            availableSpaceX = spaceRight - egdeGap;
                            availableSpaceY = window.innerHeight - egdeGap - padding;
                        }
                    }

                    if (balloonRect.height > availableSpaceY) {
                        balloonHeight = availableSpaceY;
                    }

                    if (balloonRect.width > availableSpaceX) {
                        balloonWidth = availableSpaceX;
                    }

                    switch (positionY) {
                        case "top":
                            balloonTop = triggerRect.top;

                            if ((balloonTop - balloonHeight) < 0) {
                                positionY = "bottom";
                            }
                            break;

                        case "bottom":
                            balloonTop = triggerRect.top + triggerRect.height;

                            if (balloonTop + balloonHeight > window.innerHeight) {
                                positionY = "top";
                            }
                            break;
                    }

                    switch (positionX) {
                        case "left":
                            balloonLeft = triggerRect.left;

                            if ((balloonLeft - balloonWidth) < 0) {
                                positionX = "right";
                            }
                            break;

                        case "right":
                            balloonLeft = triggerRect.left + triggerRect.width;

                            if (balloonLeft + balloonWidth > window.innerWidth) {
                                positionX = "left";
                            }
                            break;
                    }

                    balloonTipElement.classList.remove("balloon-top");
                    balloonTipElement.classList.remove("balloon-bottom");
                    balloonTipElement.classList.remove("balloon-left");
                    balloonTipElement.classList.remove("balloon-right");

                    if (preferredDirection === "vertical") {
                        switch (positionY) {
                            case "top":
                                balloonTop = triggerRect.top - balloonHeight - padding;
                                balloonLeft = triggerRect.left + Math.floor(triggerRect.width / 2) - Math.floor(balloonWidth / 2);
                                balloonTipX = triggerRect.left + Math.floor(triggerRect.width / 2) - Math.floor(balloonTipSize / 2);
                                balloonTipY = triggerRect.top - Math.floor(balloonTipSize / 2) - padding;
                                balloonTipElement.classList.add("balloon-top");
                                selectedPosition = "top";
                                break;

                            case "bottom":
                                balloonTop = triggerRect.top + triggerRect.height + padding;
                                balloonLeft = triggerRect.left + Math.floor(triggerRect.width / 2) - Math.floor(balloonWidth / 2);
                                balloonTipX = triggerRect.left + Math.floor(triggerRect.width / 2) - Math.floor(balloonTipSize / 2);
                                balloonTipY = triggerRect.bottom - Math.floor(balloonTipSize / 2) + padding;
                                balloonTipElement.classList.add("balloon-bottom");
                                selectedPosition = "bottom";
                                break;
                        }
                    }
                    else {
                        switch (positionX) {
                            case "left":
                                balloonTop = triggerRect.top + Math.floor(triggerRect.height / 2) - Math.floor(balloonHeight / 2);
                                balloonLeft = triggerRect.left - balloonWidth - padding;
                                balloonTipX = triggerRect.left - Math.floor(balloonTipSize / 2) - padding;
                                balloonTipY = triggerRect.top + Math.floor(triggerRect.height / 2) - Math.floor(balloonTipSize / 2);
                                balloonTipElement.classList.add("balloon-left");
                                selectedPosition = "left";
                                break;

                            case "right":
                                balloonTop = triggerRect.top + Math.floor(triggerRect.height / 2) - Math.floor(balloonHeight / 2);
                                balloonLeft = triggerRect.right + padding;
                                balloonTipX = triggerRect.right - Math.floor(balloonTipSize / 2) + padding;
                                balloonTipY = triggerRect.top + Math.floor(triggerRect.height / 2) - Math.floor(balloonTipSize / 2);
                                balloonTipElement.classList.add("balloon-right");
                                selectedPosition = "right";
                                break;
                        }
                    }

                    if (balloonTop < egdeGap) {
                        balloonTop = egdeGap;
                    }

                    if (balloonTop + balloonHeight > innerHeight - egdeGap) {
                        balloonBottom = egdeGap;
                    }
                    else {
                        balloonBottom = innerHeight - (balloonTop + balloonHeight);
                    }

                    if (balloonLeft < egdeGap) {
                        balloonLeft = egdeGap;
                    }

                    delete balloonElement.style.top;
                    delete balloonElement.style.bottom;
                    delete balloonElement.style.left;
                    delete balloonElement.style.right;

                    if (balloonTop + balloonHeight > window.innerHeight) {
                        const overflowCorrection = (balloonTop + balloonHeight) - window.innerHeight;
                        balloonTop = balloonTop - overflowCorrection;
                    }

                    switch (selectedPosition) {
                        case "top":
                            balloonElement.style.bottom = `${balloonBottom}px`;
                            balloonElement.style.left = `${balloonLeft}px`;
                            break;

                        case "bottom":
                            balloonElement.style.top = `${balloonTop}px`;
                            balloonElement.style.left = `${balloonLeft}px`;
                            break;

                        case "left":
                            balloonElement.style.top = `${balloonTop}px`;
                            balloonElement.style.height = `${balloonHeight}px`;
                            // balloonElement.style.right = `${balloonRight}px`; // TODO: Make it work
                            balloonElement.style.left = `${balloonLeft}px`;
                            break;

                        case "right":
                            balloonElement.style.top = `${balloonTop}px`;
                            balloonElement.style.height = `${balloonHeight}px`;
                            balloonElement.style.left = `${balloonLeft}px`;
                            break;
                    }

                    balloonElement.style.maxHeight = availableSpaceY + "px";
                    balloonElement.style.maxWidth = availableSpaceX + "px";

                    balloonTipElement.style.top = `${balloonTipY}px`;
                    balloonTipElement.style.left = `${balloonTipX}px`;
                };

                const openBalloon = (returnFocusTo?: HTMLElement): void => {
                    if (options.isDisabled && options.isDisabled()) {
                        return;
                    }

                    if (balloonState !== BalloonState.opening) {
                        return;
                    }

                    resetCloseTimeout();

                    const existingBalloonHandle: BalloonHandle = toggleElement["activeBalloon"];

                    if (existingBalloonHandle) {
                        if (activateOn === BalloonActivationOptions.hoverOrFocus) {
                            return;
                        }
                        else {
                            existingBalloonHandle.close();
                        }
                    }

                    setImmediate(() => { // give chance to view stack to clear unrelated views
                        const activeBalloonHandle: BalloonHandle = toggleElement["activeBalloon"];

                        if (activeBalloonHandle) {
                            if (activateOn === BalloonActivationOptions.hoverOrFocus) {
                                return;
                            }
                            else {
                                activeBalloonHandle.close();
                            }
                        }

                        createBalloonElement();
                        createBalloonTip();

                        balloonView = {
                            close: closeBalloon,
                            element: balloonElement,
                            returnFocusTo: returnFocusTo,
                            hitTest: (targetElement) => {
                                const element =
                                    Html.closest(targetElement, x => x === balloonElement) ||
                                    Html.closest(targetElement, x => x === toggleElement);

                                return !!element;
                            }
                        };

                        viewStack.runHitTest(toggleElement);
                        viewStack.pushView(balloonView);

                        if (activateOn === BalloonActivationOptions.clickOrKeyDown) {
                            toggleElement.setAttribute(Html.AriaAttributes.expanded, "true");
                        }

                        toggleElement["activeBalloon"] = ballonHandle;

                        balloonElement.classList.add("balloon-is-active");
                        requestAnimationFrame(updatePosition);
                        balloonState = BalloonState.open;

                        if (options.onOpen) {
                            options.onOpen();
                        }

                        if (activateOn === BalloonActivationOptions.hoverOrFocus) {
                            balloonElement.addEventListener("mouseenter", () => {
                                inBalloon = true;
                            });

                            balloonElement.addEventListener("mouseleave", () => {
                                inBalloon = false;
                                checkCloseHoverBalloon();
                            });
                        }
                    });
                };

                const closeBalloon = (): void => {
                    if (!balloonElement) {
                        return;
                    }

                    if (options.onClose) {
                        options.onClose();
                    }

                    removeBalloon();
                    toggleElement.setAttribute(Html.AriaAttributes.expanded, "false");
                };

                const toggle = (): void => {
                    resetCloseTimeout();

                    if (balloonState === BalloonState.open) {
                        if (!options.closeTimeout) {
                            balloonState = BalloonState.closing;
                            closeBalloon();
                        }
                    }
                    else {
                        balloonState = BalloonState.opening;
                        openBalloon(toggleElement);
                    }
                };

                const ballonHandle: BalloonHandle = {
                    open: openBalloon,
                    close: closeBalloon,
                    toggle: toggle,
                    updatePosition: () => requestAnimationFrame(updatePosition)
                };

                if (options.onCreated) {
                    options.onCreated(ballonHandle);
                }

                const onPointerDown = async (event: MouseEvent): Promise<void> => {
                    if (!toggleElement) {
                        return;
                    }

                    const targetElement = <HTMLElement>event.target;
                    const element = Html.closest(targetElement, (node) => node === toggleElement);

                    if (!element) {
                        return;
                    }

                    toggle();
                };

                const onFocus = (): void => {
                    balloonState = BalloonState.opening;
                    openBalloon();
                };

                const onBlur = (): void => {
                    balloonState = BalloonState.closing;
                    closeBalloon();
                };

                const onMouseEnter = (event: MouseEvent): void => {
                    isHoverOver = true;

                    balloonState = BalloonState.opening;

                    setTimeout(() => {
                        if (!isHoverOver) {
                            return;
                        }

                        openBalloon();
                    }, options.delay || 0);
                };

                const onMouseLeave = (event: MouseEvent): void => {
                    isHoverOver = false;
                    checkCloseHoverBalloon();
                };

                const checkCloseHoverBalloon = (): void => {
                    setTimeout(() => {
                        if (!isHoverOver && !inBalloon) {
                            balloonState = BalloonState.closing;
                            closeBalloon();
                        }
                    }, 50);
                };

                const onKeyDown = (event: KeyboardEvent): void => {
                    switch (event.key) {
                        case Keys.Enter:
                        case Keys.Space:
                            event.preventDefault();
                            toggle();
                            break;
                    }
                };

                const onClick = (event: MouseEvent): void => {
                    event.preventDefault();
                };

                const onScroll = async (event: MouseEvent): Promise<void> => {
                    if (!balloonElement) {
                        return;
                    }

                    requestAnimationFrame(updatePosition);
                };

                if (options.closeOn) {
                    options.closeOn.subscribe(() => closeBalloon());
                }

                toggleElement.addEventListener(Events.Click, onClick);
                window.addEventListener(Events.Scroll, onScroll, true);
                document.addEventListener(Events.MouseDown, onPointerDown, true);

                switch (activateOn) {
                    case BalloonActivationOptions.clickOrKeyDown:
                        toggleElement.addEventListener(Events.KeyDown, onKeyDown);
                        break;

                    case BalloonActivationOptions.hoverOrFocus:
                        toggleElement.addEventListener(Events.MouseEnter, onMouseEnter);
                        toggleElement.addEventListener(Events.MouseLeave, onMouseLeave);
                        break;

                    case BalloonActivationOptions.all:
                        toggleElement.addEventListener(Events.KeyDown, onKeyDown);
                        toggleElement.addEventListener(Events.MouseEnter, onMouseEnter);
                        toggleElement.addEventListener(Events.MouseLeave, onMouseLeave);
                        break;

                    default:
                        throw new Error(`Unknown balloon trigger event: ${activateOn}`);
                }

                ko.utils.domNodeDisposal.addDisposeCallback(toggleElement, () => {
                    balloonState = BalloonState.closing;
                    window.removeEventListener(Events.MouseDown, onPointerDown, true);
                    toggleElement.removeEventListener(Events.Click, onClick);

                    switch (activateOn) {
                        case BalloonActivationOptions.clickOrKeyDown:
                            toggleElement.removeEventListener(Events.KeyDown, onKeyDown);
                            break;

                        case BalloonActivationOptions.hoverOrFocus:
                            toggleElement.removeEventListener(Events.MouseEnter, onMouseEnter);
                            toggleElement.removeEventListener(Events.MouseLeave, onMouseLeave);
                            break;

                        case BalloonActivationOptions.all:
                            toggleElement.removeEventListener(Events.KeyDown, onKeyDown);
                            toggleElement.removeEventListener(Events.MouseEnter, onMouseEnter);
                            toggleElement.removeEventListener(Events.MouseLeave, onMouseLeave);
                            break;

                        default:
                            throw new Error(`Unknown balloon trigger event: ${activateOn}`);
                    }

                    removeBalloon();
                    window.removeEventListener(Events.Scroll, onScroll, true);
                });
            }
        };
    }
}