export interface Food {
    code: string;
    name: string;
    category: string;
    servingSize: string; // 기준량
    calories: number; // 칼로리
    carbs: number; // 탄수화물(g)
    protein: number; // 단백질(g)
    fat: number; // 지방(g)
    sugar: number; // 당(g)
    sodium: number; // 나트륨(mg)
}

export interface MealItem {
    food: Food;
    amount: number; // 섭취량 배수 (1 = 기준량)
}

export interface DailyMeal {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snack: MealItem[];
}

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';
