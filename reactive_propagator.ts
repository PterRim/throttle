import { construct_propagator } from "ppropogator/Propagator/Propagator";
import type { Cell } from "ppropogator/Cell/Cell";
import { subscribe, tap } from "ppropogator/Shared/Reactivity/Reactor";
import { cell_strongest } from "ppropogator/Cell/Cell";
import { pipe } from "fp-ts/lib/function";
import { combine_latest } from "ppropogator/Shared/Reactivity/Reactor";
import {  is_no_compute } from "./no_compute";
import { map, filter } from "ppropogator/Shared/Reactivity/Reactor";
import { event_procedure } from "./traced_timestamp";


export function construct_effect_propagator<A>(name: string, f: (...a: any[]) => A){
 // a specialize propagator filter out no compute value
   return (inputs: Cell[], output: Cell) => {

        const inputs_reactors = inputs.map(cell => cell_strongest(cell));
        const reactive_f = event_procedure(f);

        return construct_propagator(name, inputs, [output], () => {
            const activator = pipe(combine_latest(...inputs_reactors),
                map(values => {
                    return reactive_f(...values);
                }),
                filter(value => !is_no_compute(value)))


            subscribe((v: any) => {
                output.addContent(v);
            })(activator);

            return activator;
        })
    }
}

// export function construct_signal_propagator(name: string, f: (base: any, timestamp: number) => any){
//     return (input: Cell, output: Cell) => {
//         const input_reactor = cell_strongest(input);
//         const reactive_f = (o: LayeredObject) => signal_procedure(o, f);

//         return construct_propagator(name, [input], [output], () => {
//             const activator = pipe(input_reactor,
//                 map(reactive_f),
//                 filter(value => !is_no_compute(value)))

//             subscribe((v: any) => {
//                 output.addContent(v);
//             })(activator);

//             return activator;
//         })
//     }
// }
