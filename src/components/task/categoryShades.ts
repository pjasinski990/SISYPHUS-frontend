import { TaskCategory } from "../../service/taskService";

export interface CategoryShades {
    lightBg: string;
    darkBg: string;
    lightHoverBg: string;
    darkHoverBg: string;
    lightBorderHover: string;
    darkBorderHover: string;
    lightIcon: string;
    darkIcon: string;
}

const categoryShades: Record<TaskCategory, CategoryShades> = {
    [TaskCategory.GREEN]: {
        lightBg: "green-100",
        darkBg: "green-800",
        lightHoverBg: "green-200",
        darkHoverBg: "green-900",
        lightBorderHover: "green-200",
        darkBorderHover: "green-600",
        lightIcon: "green-500",
        darkIcon: "green-300",
    },
    [TaskCategory.BLUE]: {
        lightBg: "blue-100",
        darkBg: "blue-800",
        lightHoverBg: "blue-200",
        darkHoverBg: "blue-900",
        lightBorderHover: "blue-200",
        darkBorderHover: "blue-600",
        lightIcon: "blue-500",
        darkIcon: "blue-300",
    },
    [TaskCategory.RED]: {
        lightBg: "red-100",
        darkBg: "red-800",
        lightHoverBg: "red-200",
        darkHoverBg: "red-900",
        lightBorderHover: "red-200",
        darkBorderHover: "red-600",
        lightIcon: "red-500",
        darkIcon: "red-300",
    },
    [TaskCategory.YELLOW]: {
        lightBg: "yellow-100",
        darkBg: "yellow-700",
        lightHoverBg: "yellow-200",
        darkHoverBg: "yellow-800",
        lightBorderHover: "yellow-200",
        darkBorderHover: "yellow-600",
        lightIcon: "yellow-500",
        darkIcon: "yellow-300",
    },
    [TaskCategory.WHITE]: {
        lightBg: "gray-100",
        darkBg: "gray-500",
        lightHoverBg: "gray-200",
        darkHoverBg: "gray-600",
        lightBorderHover: "gray-200",
        darkBorderHover: "gray-400",
        lightIcon: "gray-400",
        darkIcon: "gray-300",
    },
    [TaskCategory.PINK]: {
        lightBg: "pink-100",
        darkBg: "pink-800",
        lightHoverBg: "pink-200",
        darkHoverBg: "pink-900",
        lightBorderHover: "pink-200",
        darkBorderHover: "pink-600",
        lightIcon: "pink-500",
        darkIcon: "pink-300",
    },
};

interface CategoryStyleClasses {
    categoryColorClass: string;
    categoryHoverColorClass: string;
    categoryBorderColorClass: string;
    iconClass: string;
}

const generateCategoryStyles = (shades: CategoryShades): CategoryStyleClasses => ({
    categoryColorClass: `bg-${shades.lightBg} dark:bg-${shades.darkBg}`,
    categoryHoverColorClass: `hover:bg-${shades.lightHoverBg} dark:hover:bg-${shades.darkHoverBg}`,
    categoryBorderColorClass: `hover:border-4 hover:border-${shades.lightBorderHover} dark:hover:border-${shades.darkBorderHover}`,
    iconClass: `stroke-${shades.lightIcon} dark:stroke-${shades.darkIcon} fill-${shades.lightIcon} dark:fill-${shades.darkIcon}`,
});

export const categoryStyles: Record<TaskCategory, CategoryStyleClasses> = {} as Record<TaskCategory, CategoryStyleClasses>;

(Object.keys(categoryShades) as Array<TaskCategory>).forEach((category) => {
    categoryStyles[category] = generateCategoryStyles(categoryShades[category]);
});
