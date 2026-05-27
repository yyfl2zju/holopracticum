import { ContractReviewPage } from "@/components/contracts/contract-review-page";
import { getContractReviewData } from "@/lib/mock-data";

export default async function ContractsPage() {
  const data = await getContractReviewData();

  return <ContractReviewPage data={data} />;
}
