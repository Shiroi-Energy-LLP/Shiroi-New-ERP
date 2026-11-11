import { redirect } from "next/navigation";

export default async function DivisionHome({ params }: PageProps<"/[division]">) {
  redirect(`/${(await params).division}/dashboard`);
}
