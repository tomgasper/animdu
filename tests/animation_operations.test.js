import { beforeAll, describe, expect, it, vi } from "vitest";

import { ObjNode } from "../src/UI/NodeEditor/ObjNode";
import { ComponentNode } from "../src/UI/NodeEditor/ComponentNode";
import { Component } from "../src/UI/NodeEditor/Component";
import { UINode } from "../src/UI/NodeEditor/UINode";

import { createComponentList } from "../src/animation/animation_operations";

import { gatherComponentsAtTime } from "../src/animation/animation_operations";

// Mock dependency
vi.mock("../src/UI/NodeEditor/UIObject");

beforeAll(() => {
    vi.spyOn(UINode.prototype, "setStyle").mockImplementation( () => {} );
    vi.spyOn(Component.prototype, "initialize").mockImplementation( () => {} );
    vi.spyOn(ComponentNode.prototype, "initialize").mockImplementation( () => {} );
})

describe("createComponentList function", () => {
    it("should create components list correctly", () => {
        const appRef = {
            canvas:
            {
                width: undefined,
                height: undefined
            }
        };
        const webGlBuffer = undefined;
        const component = undefined;

        const component2 = new Component(appRef, webGlBuffer, 5.0)
        const node2 = new ComponentNode(appRef, webGlBuffer, component2);
        node2.elements.handles.R =[
            { line: { connection: {
                animationBreak: 0.,
                isConnected: false,
                connectedObj: undefined } } }
        ];

        const component1 = new Component(appRef, webGlBuffer, 5.0)
        const node1 = new ComponentNode(appRef, webGlBuffer, component1);
        node1.elements.handles.R =[
            { line: { connection: {
                animationBreak: 0.,
                isConnected: true,
                connectedObj: 
                { 
                    node: node2
                }}}}
        ];

        const componentList = createComponentList(0, node1);

        const line1animationBreak = 0.0;
        const DELAY = 1/60;

        const startOffset = 0;
        const expectedComponentList = [
            {
              componentRef: node1,
              range: [startOffset, startOffset + node1.component.animation.duration],
            },
            {
            componentRef: node2,
            range: [ DELAY + startOffset + node1.component.animation.duration,
                     DELAY + startOffset + node1.component.animation.duration + line1animationBreak + node2.component.animation.duration],
            },
          ];

        expect(componentList).toEqual(expectedComponentList);
    })
});

describe("gatherComponentsAtTime", () => {
    it("should return correctly sorted list", () => {
        const animationList = [{
            componentsToProcess: [{
                componentRef: {
                    component: {
                        name: 'Component1'
                    },
                    elements: {
                        handles: {
                            L: [{
                                line: {
                                    connection: {
                                        isConnected: false,
                                        connectedObj: null
                                    }
                                }
                            }]
                        }
                    }
                },
                range: [0, 5]
            }]
        }];

        const result = gatherComponentsAtTime(3, animationList);
        
        expect(result).toHaveLength(1);
        expect(result[0].component.name).toBe('Component1');
    })

    it('returns components with chained dependencies in the correct order', () => {
        let componentNode1 = {
            componentRef: undefined,
            range: undefined
        };

        let componentNode2 = {
            componentRef: undefined,
            range: undefined
        };

        let componentNode3 = {
            componentRef: undefined,
            range: undefined
        };

        componentNode1 = {
            componentRef: {
                component: { name: 'ComponentNode1' },
                elements: {
                    handles: {
                        L: [{}],
                        R: [ { line: { connection: { isConnected: false } } },
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode3.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode2 = {
            componentRef: {
                component: { name: 'ComponentNode2' },
                elements: {
                    handles: {
                        L: [ {} ],
                        R: [{ line: { connection: { isConnected: false } } },
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode3.componentRef } } } }]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode3 = {
            componentRef: {
                component: { name: 'ComponentNode3' },
                elements: {
                    handles: {
                        L: [
                            { },
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode1.componentRef } } } },
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode2.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };
    
        const animationList = [{
            obj:undefined,
            componentsToProcess: [
                componentNode1
            ]},
            {
            obj: undefined,
            componentsToProcess: [
                componentNode2
            ]},
            {
            obj: undefined,
            componentsToProcess: [
                componentNode3
            ]
            }   
        ];
    
        const result = gatherComponentsAtTime(5, animationList);

        expect(result).toHaveLength(3);
        expect(result[2].component.name).toBe('ComponentNode3');
    });

    it('returns components with chained dependencies in the correct order - COMPLEX SCENARIO', () => {
        let componentNode0 = {
            componentRef: undefined,
            range: undefined
        };
        let componentNode1 = {
            componentRef: undefined,
            range: undefined
        };
        let componentNode2 = {
            componentRef: undefined,
            range: undefined
        };
        let componentNode3 = {
            componentRef: undefined,
            range: undefined
        };
        let componentNode4 = {
            componentRef: undefined,
            range: undefined
        };
        let componentNode5 = {
            componentRef: undefined,
            range: undefined
        };
        let componentNode6 = {
            componentRef: undefined,
            range: undefined
        };

        componentNode0 = {
            componentRef: {
                component: { name: 'ComponentNode0' },
                elements: {
                    handles: {
                        L: [ {},
                            ],
                        R: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode1.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode1 = {
            componentRef: {
                component: { name: 'ComponentNode1' },
                elements: {
                    handles: {
                        L: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode0.componentRef }  } } }],
                        R: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode3.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode2 = {
            componentRef: {
                component: { name: 'ComponentNode2' },
                elements: {
                    handles: {
                        L: [ {},
                            ],
                        R: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode3.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode3 = {
            componentRef: {
                component: { name: 'ComponentNode3' },
                elements: {
                    handles: {
                        L: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode1.componentRef }  } } },
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode2.componentRef }  } } }],
                        R: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode4.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode4 = {
            componentRef: {
                component: { name: 'ComponentNode4' },
                elements: {
                    handles: {
                        L: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode3.componentRef }  } } },
                            ],
                        R: [ {}
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode5 = {
            componentRef: {
                component: { name: 'ComponentNode5' },
                elements: {
                    handles: {
                        L: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode3.componentRef }  } } },
                            ],
                        R: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode6.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        componentNode6 = {
            componentRef: {
                component: { name: 'ComponentNode6' },
                elements: {
                    handles: {
                        L: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode5.componentRef }  } } },
                            ],
                        R: [ {},
                        ]
                    }
                }
            },
            range: [0, 10]
        };
    
        const animationList = [{
            obj:undefined,
            componentsToProcess: [
                componentNode5
            ]},
            {
            obj: undefined,
            componentsToProcess: [
                componentNode2
            ]},
            {
                obj: undefined,
                componentsToProcess: [
                    componentNode6
                ]
            },
            {
                obj: undefined,
                componentsToProcess: [
                    componentNode4
                ]
                },
            {
            obj: undefined,
            componentsToProcess: [
                componentNode1
            ]
            },
            {
                obj: undefined,
                componentsToProcess: [
                    componentNode3
                ]
            },
            {
                obj: undefined,
                componentsToProcess: [
                    componentNode0
                ]
            },     
        ];
    
        const result = gatherComponentsAtTime(3, animationList);

        // Correct dependency:
        // ComponentNode0 before ComponentNode1
        // ComponentNode2 before ComponentNode3
        // ComponentNode3 before ComponentNode4 and ComponentNode5
        // ComponentNode5 before ComponentNode6

        const indxOfLastNode = parseInt(result[6].component.name.slice(-1));
        const indxOfFirstNode = parseInt(result[0].component.name.slice(-1));

        expect([4,6]).toContain(indxOfLastNode);
        expect([0,2]).toContain(indxOfFirstNode);
    });


    it('should only gather active components that fall into the range', () => {
        let componentNode1 = {
            componentRef: undefined,
            range: undefined
        };

        let componentNode2 = {
            componentRef: undefined,
            range: undefined
        };

        let componentNode3 = {
            componentRef: undefined,
            range: undefined
        };

        componentNode1 = {
            componentRef: {
                component: { name: 'ComponentNode1' },
                elements: {
                    handles: {
                        L: [{}],
                        R: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode2.componentRef } } } }
                        ]
                    }
                }
            },
            range: [3, 6]
        };

        componentNode2 = {
            componentRef: {
                component: { name: 'ComponentNode2' },
                elements: {
                    handles: {
                        L: [ {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode1.componentRef } } } } ],
                        R: [ {},
                            ]
                    }
                }
            },
            range: [2, 8]
        };

        componentNode3 = {
            componentRef: {
                component: { name: 'ComponentNode3' },
                elements: {
                    handles: {
                        L: [
                            {},
                            { line: { connection: { isConnected: true, connectedObj: { node: componentNode2.componentRef } } } }
                        ]
                    }
                }
            },
            range: [0, 10]
        };

        const animationList = [{
            obj:undefined,
            componentsToProcess: [
                componentNode3
            ]},
            {
            obj: undefined,
            componentsToProcess: [
                componentNode1
            ]},
            {
            obj: undefined,
            componentsToProcess: [
                componentNode2
            ]
            }   
        ];

        const resultAtTime1 = gatherComponentsAtTime(1, animationList);
        expect(resultAtTime1).toHaveLength(1);

        const resultAtTime2 = gatherComponentsAtTime(3.5, animationList);
        expect(resultAtTime2[0].component.name).toBe("ComponentNode1");
        expect(resultAtTime2[2].component.name).toBe("ComponentNode3");
        expect(resultAtTime2).toHaveLength(3);

        const resultAtTime3 = gatherComponentsAtTime(8, animationList);
        expect(resultAtTime3[0].component.name).toBe("ComponentNode2");
        expect(resultAtTime3[1].component.name).toBe("ComponentNode3");
        expect(resultAtTime3).toHaveLength(2);

        const resultAtTime4 = gatherComponentsAtTime(8.01, animationList);
        expect(resultAtTime4).toHaveLength(1);

        // No active objects at given time
        const resultAtTime5 = gatherComponentsAtTime(23.51, animationList);
        expect(resultAtTime5).toHaveLength(0);
    });
})