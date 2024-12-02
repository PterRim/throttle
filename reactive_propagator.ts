import { construct_propagator } from "ppropogator/Propagator/Propagator";
import type { Cell } from "ppropogator/Cell/Cell";
import { subscribe, tap } from "ppropogator/Shared/Reactivity/Reactor";
import { cell_strongest } from "ppropogator/Cell/Cell";
import { pipe } from "fp-ts/lib/function";
import { combine_latest } from "ppropogator/Shared/Reactivity/Reactor";
import { is_no_compute } from "./no_compute";
import { map, filter } from "ppropogator/Shared/Reactivity/Reactor";
import { make_reactive_procedure } from "./traced_timestamp";
import { get_base_value } from "sando-layer/Basic/Layer";

export function construct_reactive_propagator(name: string, f: (...a: any[]) => any){
 // a specialize propagator filter out no compute value
   return (inputs: Cell[], output: Cell) => {

        const inputs_reactors = inputs.map(cell => cell_strongest(cell));
        const reactive_f = make_reactive_procedure(f);

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