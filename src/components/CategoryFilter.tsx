import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const categories: Category[] = [
  { id: 'all', name: 'All', color: 'default' },
  { id: 'python', name: 'Python', color: 'python' },
  { id: 'javascript', name: 'JavaScript', color: 'javascript' },
  { id: 'typescript', name: 'TypeScript', color: 'typescript' },
  { id: 'react', name: 'React', color: 'react' },
  { id: 'java', name: 'Java', color: 'java' },
  { id: 'cpp', name: 'C++', color: 'cpp' },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }: Omit<CategoryFilterProps, 'categories'>) => {
  return (
    <div className="py-4 border-b border-border/50">
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4 pb-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`
                cursor-pointer px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300
                ${selectedCategory === category.id 
                  ? `category-${category.color} shadow-glow border-transparent` 
                  : 'bg-surface border-border/50 hover:text-foreground hover:border-primary/50'
                }
                text-white !important
              `}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;