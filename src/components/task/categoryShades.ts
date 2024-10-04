import { TaskCategory } from '../../service/taskService';

export interface CategoryShades {
    lightBg: string;
    darkBg: string;
    lightHoverBg: string;
    darkHoverBg: string;
    lightBorderHover: string;
    darkBorderHover: string;
    lightIcon: string;
    darkIcon: string;
    lightMarkers: string;
    darkMarkers: string;
}

export const categoryShades: Record<TaskCategory, CategoryShades> = {
    [TaskCategory.GREEN]: {
        lightBg: 'green-100',
        darkBg: 'green-800',
        lightHoverBg: 'green-200',
        darkHoverBg: 'green-900',
        lightBorderHover: 'green-200',
        darkBorderHover: 'green-400',
        lightIcon: 'green-500',
        darkIcon: 'green-300',
        lightMarkers: 'green-400',
        darkMarkers: 'green-100',
    },
    [TaskCategory.BLUE]: {
        lightBg: 'blue-100',
        darkBg: 'blue-800',
        lightHoverBg: 'blue-200',
        darkHoverBg: 'blue-900',
        lightBorderHover: 'blue-200',
        darkBorderHover: 'blue-400',
        lightIcon: 'blue-500',
        darkIcon: 'blue-300',
        lightMarkers: 'blue-400',
        darkMarkers: 'blue-100',
    },
    [TaskCategory.RED]: {
        lightBg: 'red-100',
        darkBg: 'red-800',
        lightHoverBg: 'red-200',
        darkHoverBg: 'red-900',
        lightBorderHover: 'red-200',
        darkBorderHover: 'red-400',
        lightIcon: 'red-500',
        darkIcon: 'red-300',
        lightMarkers: 'red-400',
        darkMarkers: 'red-100',
    },
    [TaskCategory.YELLOW]: {
        lightBg: 'yellow-100',
        darkBg: 'yellow-700',
        lightHoverBg: 'yellow-200',
        darkHoverBg: 'yellow-800',
        lightBorderHover: 'yellow-200',
        darkBorderHover: 'yellow-400',
        lightIcon: 'yellow-500',
        darkIcon: 'yellow-300',
        lightMarkers: 'yellow-400',
        darkMarkers: 'yellow-100',
    },
    [TaskCategory.WHITE]: {
        lightBg: 'gray-100',
        darkBg: 'gray-600',
        lightHoverBg: 'gray-200',
        darkHoverBg: 'gray-700',
        lightBorderHover: 'gray-200',
        darkBorderHover: 'gray-400',
        lightIcon: 'gray-300',
        darkIcon: 'gray-200',
        lightMarkers: 'gray-500',
        darkMarkers: 'gray-100',
    },
    [TaskCategory.PINK]: {
        lightBg: 'pink-100',
        darkBg: 'pink-800',
        lightHoverBg: 'pink-200',
        darkHoverBg: 'pink-900',
        lightBorderHover: 'pink-200',
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
    categoryBorderColorClass: string;
    iconClass: string;
}

const generateCategoryStyles = (
    shades: CategoryShades
): CategoryStyleClasses => ({
    categoryHighlightClass: `border-4 border-${shades.lightBorderHover} dark:border-${shades.darkBorderHover}`,
    categoryMarkerColorClass: `marker:text-${shades.lightMarkers} dark:marker:text-${shades.darkMarkers}`,
    categoryBgColorClass: `bg-${shades.lightBg} dark:bg-${shades.darkBg}`,
    categoryBgHoverColorClass: `hover:bg-${shades.lightHoverBg} dark:hover:bg-${shades.darkHoverBg}`,
    categoryBorderColorClass: `hover:border-4 hover:border-${shades.lightBorderHover} dark:hover:border-${shades.darkBorderHover}`,
    iconClass: `stroke-${shades.lightIcon} dark:stroke-${shades.darkIcon} fill-${shades.lightIcon} dark:fill-${shades.darkIcon}`,
});

export const categoryStyles: Record<TaskCategory, CategoryStyleClasses> =
    {} as Record<TaskCategory, CategoryStyleClasses>;

(Object.keys(categoryShades) as Array<TaskCategory>).forEach(category => {
    categoryStyles[category] = generateCategoryStyles(categoryShades[category]);
});
