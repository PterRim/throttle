
import { reference_store } from "ppropogator/Helper/Helper";
import { add_cell_content, cell_strongest, cell_strongest_base_value, cell_strongest_value, construct_cell, type Cell } from "ppropogator/Cell/Cell";
import { construct_propagator, primitive_propagator, type Propagator } from "ppropogator/Propagator/Propagator";
import { set_immediate_execute } from "ppropogator/Shared/Reactivity/Scheduler";

import { annotate_now, annotate_with_reference, make_reactive_procedure, stale } from "./traced_timestamp";
import { set_trace_merge } from "ppropogator/Cell/Merge";
import { combine_latest, subscribe } from "ppropogator/Shared/Reactivity/Reactor";
import { pipe } from "fp-ts/lib/function";
import { is_nothing } from "ppropogator/Cell/CellValue";
import { map, filter} from "ppropogator/Shared/Reactivity/Reactor"
import { is_no_compute } from "./no_compute";
import { construct_reactive_propagator } from "./reactive_propagator";


const new_reference_name = reference_store();


type Signal = Cell // or subject in other reactive system

function construct_node(name: string){
    return construct_cell(name + new_reference_name());
}



// primitive combinator mono directional
function construct_event(name: string, f: (...a: any[]) => any){
    // operator is propagators but it returned a cell
    return (...inputs: Cell[]) => {
        const result = construct_cell(name + new_reference_name());
        construct_reactive_propagator(name, f)(inputs, result);

        return result;
    }
}

function update(a: Signal, v: any){
    // refresh the old dependencies
    stale(cell_strongest_value(a))
    // supposely timestamp should work but javascript calculate time differently it will not work
    add_cell_content(a, annotate_now(v));
}


const _add = (a: number, b: number) => a + b;

// TODO: relationship bi-directional
const add = construct_event("add",  _add);

set_immediate_execute(true);



const a = construct_node("a");
const b = construct_node("b");


const c = add(a, b)

update(a, 2);
update(b, 3);

console.log(cell_strongest_base_value(c));

setTimeout(() => {
    update(a, 8);
    console.log(cell_strongest_base_value(c));
}, 1)




// console.log(cell_strongest_base_value(c));

// update_time(a, 8, 3);
// update_time(b, 2, 3);


// console.log(cell_strongest_base_value(c));