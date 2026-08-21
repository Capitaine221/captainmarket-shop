import LinkProductForm from "../LinkProductForm";
import { createLinkProduct } from "../../../actions";

export default async function NewLinkProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Nouveau lien</h1>
      <LinkProductForm action={createLinkProduct} />
    </div>
  );
}
