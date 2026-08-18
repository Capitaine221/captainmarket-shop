import CategoryForm from "../CategoryForm";
import { createCategory } from "../../../actions";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Nouvelle catégorie</h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
