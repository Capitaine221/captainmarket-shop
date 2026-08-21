import PackageForm from "../PackageForm";
import { createWebsitePackage } from "../../../actions";

export default async function NewWebsitePackagePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Nouveau forfait</h1>
      <PackageForm action={createWebsitePackage} />
    </div>
  );
}
