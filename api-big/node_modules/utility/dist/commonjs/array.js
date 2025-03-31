"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSlice = randomSlice;
exports.spliceOne = spliceOne;
/**
 * Array random slice with items count
 */
function randomSlice(arr, num) {
    if (!num || num >= arr.length) {
        return arr.slice();
    }
    const index = Math.floor(Math.random() * arr.length);
    const a = [];
    for (let i = 0, j = index; i < num; i++) {
        a.push(arr[j++]);
        if (j === arr.length) {
            j = 0;
        }
    }
    return a;
}
/**
 * Remove one exists element from an array
 * @param {Array} arr input array
 * @param  {Number} index - remove element index
 * @return {Array} the array instance
 */
function spliceOne(arr, index) {
    if (index < 0) {
        index = arr.length + index;
        // still negative, not found element
        if (index < 0) {
            return arr;
        }
    }
    // don't touch
    if (index >= arr.length) {
        return arr;
    }
    for (let i = index, k = i + 1, n = arr.length; k < n; i += 1, k += 1) {
        arr[i] = arr[k];
    }
    arr.pop();
    return arr;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXJyYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxrQ0FhQztBQVFELDhCQW1CQztBQTNDRDs7R0FFRztBQUNILFNBQWdCLFdBQVcsQ0FBVSxHQUFRLEVBQUUsR0FBWTtJQUN6RCxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDOUIsT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyRCxNQUFNLENBQUMsR0FBUSxFQUFFLENBQUM7SUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDeEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNyQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1IsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLFNBQVMsQ0FBVSxHQUFRLEVBQUUsS0FBYTtJQUN4RCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNkLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUMzQixvQ0FBb0M7UUFDcEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDZCxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7SUFDSCxDQUFDO0lBRUQsY0FBYztJQUNkLElBQUksS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4QixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3JFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUNELEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNWLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9