
import { reference_store } from "ppropogator/Helper/Helper";
import { add_cell_content, cell_strongest, cell_strongest_base_value, cell_strongest_value, construct_cell, type Cell } from "ppropogator/Cell/Cell";
import { compound_propagator, construct_propagator, primitive_propagator, type Propagator } from "ppropogator/Propagator/Propagator";
import { set_immediate_execute } from "ppropogator/Shared/Reactivity/Scheduler";
import { annotate_now, stale } from "./traced_timestamp";
import { construct_effect_propagator as construct_effect_propagator  } from "./reactive_propagator";
import { construct_reactor } from "ppropogator/Shared/Reactivity/Reactor";
import type { LayeredObject } from "sando-layer/Basic/LayeredObject";

const new_reference_name = reference_store();


export type Node = Cell // or signal in other reactive system

export function construct_node(name: string){
    return construct_cell(name + new_reference_name());
}

export type Behavior = Effect | Relationship

// effect is mono-directional , which is analogously to Event in conventional reactive system
export type Effect = (...nodes: Node[]) => Propagator 

export function construct_effect(name: string, f: (...o: LayeredObject[]) => any): Effect{
    // operator is propagators but it returned a cell
    return (...nodes: Node[]) => {
        const output = nodes[0];
        const inputs = nodes.slice(1);
        return construct_effect_propagator(name, f)(inputs, output);
    }
}

// Relationship is multi-directional, you can say it is like behavior, but it is not exactly the same
export type Relationship = (...nodes: Node[]) => Propagator

export function construct_relationship(name: string, f: (...a: any[]) => any): Relationship{
    return (...inputs: Cell[]) => {

        return compound_propagator(
            inputs, 
            inputs, 
            () => {
                f(); 
                // just for test
                return construct_reactor();
            }, 
            name )
    }
}


export function connect(a: Node[], b: Node, behavior: Behavior){
    // the behavior is a propagator
    return behavior(b, ...a);
}

export function broadcast(a: Node, bs: Node[], behavior: Behavior){
    return bs.map(b => connect([a], b, behavior));
} 

export function combine(as: Node[], b: Node, behavior: Behavior){
    return as.map(a => connect([a], b, behavior));
}


export function update(a: Node, v: any){
    // refresh the old dependencies
    stale(cell_strongest_value(a))
    // supposely timestamp should work but javascript calculate time differently it will not work
    add_cell_content(a, annotate_now(v));
}



export const set_immediate_execution = () => set_immediate_execute(true);

// const _add = (a: number, b: number) => a + b;

// // TODO: relationship bi-directional
// const add = construct_effect("add",  _add);

// const a = construct_node("a");
// const b = construct_node("b");


// const c = add(a, b)

// update(a, 2);
// update(b, 3);

// console.log(cell_strongest_base_value(c));

// setTimeout(() => {
//     update(a, 8);
//     console.log(cell_strongest_base_value(c));
// }, 1)




// console.log(cell_strongest_base_value(c));

// update_time(a, 8, 3);
// update_time(b, 2, 3);


// console.log(cell_strongest_base_value(c));