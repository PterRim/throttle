import { annotate_time, get_time_layer_value, has_time_layer } from "sando-layer/Specified/TimeLayer";
import { define_handler, generic_merge, strongest_value, all_match, construct_cell, construct_propagator } from "ppropogator"
import { register_predicate } from "generic-handler/Predicates";
import type { LayeredObject } from "sando-layer/Basic/LayeredObject";
import { guard, throw_error } from "generic-handler/built_in_generics/other_generic_helper";
import { to_string } from "generic-handler/built_in_generics/generic_conversation";
import { reference_store } from "ppropogator/Helper/Helper";
import { add_cell_content, cell_strongest_base_value, cell_strongest_value, type Cell } from "ppropogator/Cell/Cell";
import { primitive_propagator, type Propagator } from "ppropogator/Propagator/Propagator";
import { set_immediate_execute } from "ppropogator/Shared/Reactivity/Scheduler";
import { get_base_value } from "sando-layer/Basic/Layer";
import { set_trace_merge } from "ppropogator/Cell/Merge";
import { the_nothing } from "ppropogator/Cell/CellValue";

const is_timestamped_value = register_predicate("is_timestamped_value", has_time_layer);

const get_time_stamp = (a: any) => {
    return get_time_layer_value(a).timestamp;
}

const get_value = (a: any) => {
    return get_base_value(a);
}

function fresher(a: LayeredObject, b: LayeredObject){
    return get_time_stamp(a) > get_time_stamp(b);
}

define_handler(generic_merge, all_match(is_timestamped_value), (a: LayeredObject, b: LayeredObject) => {
   if(fresher(a, b)){
       return a;
   }
   else if (fresher(b, a)){
       return b;
   }
});

// how to expressively merge value from different time?
function merge_base(f: (...a: any[]) => any){
    return (...a: any[]) => {
        // compute only all the inputs have the same timestamp
        guard(a.length > 0, throw_error("construct_reactive_function", 
                                        "no inputs", 
                                        to_string(a)));
        // but if doing so two different input will never be merged
        const timestamp = get_time_stamp(a[0]);
        if (a.every((x: any) => get_time_stamp(x) === timestamp)){
            return annotate_time(f(...a.map(get_base_value)), timestamp);
        }
        else{
            return the_nothing;
        }
    }
}

function merge_latest(f: (...a: any[]) => any){
    return (...a: any[]) => {
        return annotate_time(f(...a.map(get_base_value)), Math.max(...a.map(get_time_stamp)));
    }
}

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
        primitive_propagator(f, name)(...inputs, result);
        return result;
    }
}

function construct_event_with_default_merge(name: string, f: (...a: any[]) => any){
    return construct_event(name, merge_base(f));
}

function update(a: Signal, v: any){
    add_cell_content(a, annotate_time(v));
}

//for test
function update_time(a: Signal, v: any, timestamp: number){
    add_cell_content(a, annotate_time(v, timestamp));
}


const _add = (a: number, b: number) => a + b;

// TODO: relationship bi-directional
const add = construct_event("add",  merge_latest(_add));
const add1 = construct_event_with_default_merge("add1", (a: number) => a + 1);
set_immediate_execute(true);
// set_trace_merge(true);


const a = construct_node("a");
const b = construct_node("b");


const c = add(add1(a), b)

update_time(a, 1, 1);
update_time(b, 2, 2);

console.log(get_time_stamp(cell_strongest_value(c)));

// update_time(a, 2, 2);



// console.log(cell_strongest_base_value(c));

// update_time(a, 8, 3);
// update_time(b, 2, 3);


// console.log(cell_strongest_base_value(c));