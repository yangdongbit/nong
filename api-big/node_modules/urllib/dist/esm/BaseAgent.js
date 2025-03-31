import { Agent, } from 'undici';
export class BaseAgent extends Agent {
    #opaqueLocalStorage;
    constructor(options) {
        super(options);
        this.#opaqueLocalStorage = options.opaqueLocalStorage;
    }
    dispatch(options, handler) {
        const opaque = this.#opaqueLocalStorage?.getStore();
        if (opaque) {
            handler.opaque = opaque;
        }
        return super.dispatch(options, handler);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUFnZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0Jhc2VBZ2VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsS0FBSyxHQUVOLE1BQU0sUUFBUSxDQUFDO0FBUWhCLE1BQU0sT0FBTyxTQUFVLFNBQVEsS0FBSztJQUNsQyxtQkFBbUIsQ0FBa0M7SUFFckQsWUFBWSxPQUF5QjtRQUNuQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDO0lBQ3hELENBQUM7SUFFRCxRQUFRLENBQUMsT0FBOEIsRUFBRSxPQUFtQztRQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDcEQsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNWLE9BQWUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ25DLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDRiJ9