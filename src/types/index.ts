export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  subscription: 'free' | 'premium' | 'pro';
  role?:string;
  
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  purchaseDate: string;
  progress: number;
  instructor: string;
  category: string;
  thumbnail?: string;
  duration:string;
  level:string;
  status: 'completed' | 'in-progress' | 'not-started';
  courseImageURL:string;
}

export interface UserStats {
  totalCourses: number;
totalPayments:number;
  
}


