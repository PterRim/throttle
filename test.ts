
// import { set_immediate_execute } from "ppropogator/Shared/Reactivity/Scheduler";
// import { construct_effect, construct_node, construct_relationship, set_immediate_execution, update } from "./core";
// import { subscribe, until } from "./operator";
// import { pipe } from "fp-ts/lib/function";
// import type { Node } from "./core";
// import type { LayeredObject } from "sando-layer/Basic/LayeredObject";
// import { get_base_value } from "sando-layer/Basic/Layer";

// set_immediate_execution()

// const a = construct_node("a");

// const b = construct_node("b");

// const c = construct_node("c")


// const add_one = construct_effect("add_one", (a: LayeredObject) =>  get_base_value(a) + 1);
// const sub_one = construct_effect("sub_one", (a: LayeredObject) =>  get_base_value(a) - 1);

// const simple_constraint = construct_relationship("simple_constraint",
//     (a: Node, b: Node) => {
//         add_one(a, b)
//         sub_one(b, a)
//     }
// )

// simple_constraint(a, b)
// simple_constraint(b, c)

// const log = (name: string) => subscribe((a: any) => console.log(name + " " + a)) 

// log("a")(a)
// log("c")(c)
// update(c, 10)
// // update(a, 9)
// update(b, 7)