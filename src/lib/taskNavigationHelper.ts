export {};

// export const getNextListName = (
//     current: string,
//     lists: TaskList[]
// ): string | null => {
//     if (!current) {
//         return firstOrNull(lists);
//     }
//
//     const currentIndex = lists.indexOf(current);
//     if (currentIndex === -1 || currentIndex >= lists.length - 1) {
//         return null;
//     }
//     return lists[currentIndex + 1];
// };
//
// export const getPreviousListName = (
//     current: string,
//     lists: TaskList[]
// ): string | null => {
//     if (!current) {
//         return lastOrNull(lists);
//     }
//     const currentIndex = lists.indexOf(current);
//     if (currentIndex <= 0) {
//         return null;
//     }
//     return lists[currentIndex - 1];
// };
//
// export const getNextNonEmptyListName = (current: string, lists: TaskList[]): string | null => {
//     const nonEmpty =
//     if (!highlightedListName) {
//         if (skipEmpty) {
//             for (const list of visibleLists) {
//                 if (tasksLists[list]?.tasks.length > 0) {
//                     return list;
//                 }
//             }
//             return null;
//         }
//         return visibleLists.length > 0 ? visibleLists[0] : null;
//     }
//     const currentIndex = visibleLists.indexOf(highlightedListName);
//     if (currentIndex === -1 || currentIndex >= visibleLists.length - 1) {
//         return null;
//     }
//     for (let i = currentIndex + 1; i < visibleLists.length; i++) {
//         if (!skipEmpty || tasksLists[visibleLists[i]]?.tasks.length > 0) {
//             return visibleLists[i];
//         }
//     }
//     return null;
// };
//
// export const getPreviousNonEmptyListName = (
//     skipEmpty: boolean = true
// ): string | null => {
//     if (!highlightedListName) {
//         if (skipEmpty) {
//             for (let i = visibleLists.length - 1; i >= 0; i--) {
//                 const list = visibleLists[i];
//                 if (tasksLists[list]?.tasks.length > 0) {
//                     return list;
//                 }
//             }
//             return null;
//         }
//         return visibleLists.length > 0
//             ? visibleLists[visibleLists.length - 1]
//             : null;
//     }
//     const currentIndex = visibleLists.indexOf(highlightedListName);
//     if (currentIndex <= 0) {
//         return null;
//     }
//     for (let i = currentIndex - 1; i >= 0; i--) {
//         if (!skipEmpty || tasksLists[visibleLists[i]]?.tasks.length > 0) {
//             return visibleLists[i];
//         }
//     }
//     return null;
// };
//
// function firstOrNull(arr: string[]): string | null {
//     return arr.length > 0 ? arr[0] : null;
// }
//
// function lastOrNull(arr: string[]) {
//     return arr.length > 0 ? arr[arr.length - 1] : null;
// }
