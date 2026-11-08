import type { Boundary, Spot } from '../schemas';
/** All five axes must be known and included; missing information never matches. */
export function matchesBoundary(spot:Spot,boundary:Boundary):boolean {
 return spot.stake!==null && spot.stackBb!==null && spot.sizeTree!==null && spot.solutionFamily!==null && boundary.street.includes(spot.street) && boundary.stake.includes(spot.stake) && boundary.stackBb.includes(spot.stackBb) && boundary.sizeTree.includes(spot.sizeTree) && boundary.solutionFamily.includes(spot.solutionFamily);
}
