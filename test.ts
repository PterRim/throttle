
import { set_immediate_execute } from "ppropogator/Shared/Reactivity/Scheduler";
import { construct_node, set_immediate_execution, update } from "./core";
import { map_e, or, subscribe, until } from "./operator";
import { pipe } from "fp-ts/lib/function";

set_immediate_execution()

const a = construct_node("a");

const b = construct_node("b");



const add_one = map_e((a: any) => a + 1);

const log_result = subscribe((a: any) => console.log(a));

const result = until(b,  pipe(a, add_one, add_one) );
log_result(result);

update(a, 1);
update(a, 2)
update(b, true)

