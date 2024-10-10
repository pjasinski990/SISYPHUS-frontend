import { TaskCategory } from '../../service/taskService';

export interface CategoryShades {
    lightBg: string;
    darkBg: string;
    lightBgHover: string;
    darkBgHover: string;
    lightBorderHover: string;
    darkBorderHover: string;
    lightButtonHover: string;
    darkButtonHover: string;
    lightIcon: string;
    darkIcon: string;
    lightMarkers: string;
    darkMarkers: string;
}

export const categoryShades: Record<TaskCategory, CategoryShades> = {
    [TaskCategory.GREEN]: {
        lightBg: 'green-100',
        darkBg: 'green-800',
        lightBgHover: 'green-200',
        darkBgHover: 'green-700',
        lightButtonHover: 'green-300',
        darkButtonHover: 'green-800',
        lightBorderHover: 'green-300',
        darkBorderHover: 'green-400',
        lightIcon: 'green-500',
        darkIcon: 'green-300',
        lightMarkers: 'green-400',
        darkMarkers: 'green-100',
    },
    [TaskCategory.BLUE]: {
        lightBg: 'blue-100',
        darkBg: 'blue-800',
        lightBgHover: 'blue-200',
        darkBgHover: 'blue-700',
        lightButtonHover: 'blue-300',
        darkButtonHover: 'blue-800',
        lightBorderHover: 'blue-300',
        darkBorderHover: 'blue-400',
        lightIcon: 'blue-500',
        darkIcon: 'blue-300',
        lightMarkers: 'blue-400',
        darkMarkers: 'blue-100',
    },
    [TaskCategory.RED]: {
        lightBg: 'red-100',
        darkBg: 'red-800',
        lightBgHover: 'red-200',
        darkBgHover: 'red-700',
        lightButtonHover: 'red-300',
        darkButtonHover: 'red-800',
        lightBorderHover: 'red-300',
        darkBorderHover: 'red-400',
        lightIcon: 'red-500',
        darkIcon: 'red-300',
        lightMarkers: 'red-400',
        darkMarkers: 'red-100',
    },
    [TaskCategory.YELLOW]: {
        lightBg: 'yellow-100',
        darkBg: 'yellow-700',
        lightBgHover: 'yellow-200',
        darkBgHover: 'yellow-700',
        lightButtonHover: 'yellow-300',
        darkButtonHover: 'green-800',
        lightBorderHover: 'yellow-300',
        darkBorderHover: 'yellow-400',
        lightIcon: 'yellow-500',
        darkIcon: 'yellow-300',
        lightMarkers: 'yellow-400',
        darkMarkers: 'yellow-100',
    },
    [TaskCategory.WHITE]: {
        lightBg: 'gray-100',
        darkBg: 'gray-600',
        lightBgHover: 'gray-200',
        darkBgHover: 'gray-500',
        lightButtonHover: 'gray-300',
        darkButtonHover: 'gray-600',
        lightBorderHover: 'gray-300',
        darkBorderHover: 'gray-400',
        lightIcon: 'gray-300',
        darkIcon: 'gray-200',
        lightMarkers: 'gray-500',
        darkMarkers: 'gray-100',
    },
    [TaskCategory.PINK]: {
        lightBg: 'pink-100',
        darkBg: 'pink-800',
        lightBgHover: 'pink-200',
        darkBgHover: 'pink-700',
        lightButtonHover: 'pink-300',
        darkButtonHover: 'pink-800',
        lightBorderHover: 'pink-300',
        darkBorderHover: 'pink-400',
        lightIcon: 'pink-500',
        darkIcon: 'pink-300',
        lightMarkers: 'pink-400',
        darkMarkers: 'pink-100',
    },
};

interface CategoryStyleClasses {
    categoryHighlightClass: string;
    categoryMarkerColorClass: string;
    categoryBgColorClass: string;
    categoryBgHoverColorClass: string;
    categoryButtonHoverColorClass: string;
    iconClass: string;
}

const generateCategoryStyles = (
    shades: CategoryShades
): CategoryStyleClasses => ({
    categoryHighlightClass: `border-4 border-${shades.lightBorderHover} dark:border-${shades.darkBorderHover}`,
    categoryMarkerColorClass: `marker:text-${shades.lightMarkers} dark:marker:text-${shades.darkMarkers}`,
    categoryBgColorClass: `bg-${shades.lightBg} dark:bg-${shades.darkBg}`,
    categoryBgHoverColorClass: `hover:bg-${shades.lightBgHover} dark:hover:bg-${shades.darkBgHover}`,
    categoryButtonHoverColorClass: `hover:bg-${shades.lightButtonHover} dark:hover:bg-${shades.darkButtonHover}`,
    iconClass: `stroke-${shades.lightIcon} dark:stroke-${shades.darkIcon} fill-${shades.lightIcon} dark:fill-${shades.darkIcon}`,
});

export const categoryStyles: Record<TaskCategory, CategoryStyleClasses> =
    {} as Record<TaskCategory, CategoryStyleClasses>;

(Object.keys(categoryShades) as Array<TaskCategory>).forEach(category => {
    categoryStyles[category] = generateCategoryStyles(categoryShades[category]);
});
