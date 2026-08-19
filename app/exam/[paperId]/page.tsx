import { notFound } from "next/navigation";
import { PAPERS, availableMarks, paperById } from "@/data/exams";
import ExamWorkspace from "@/components/exam/ExamWorkspace";

export function generateStaticParams() {
  return PAPERS.map((paper) => ({ paperId: paper.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;
  const paper = paperById(paperId);
  return {
    title: paper ? `${paper.title} — ${paper.sitting} — Talap` : "Paper not found — Talap",
  };
}

export default async function ExamPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;
  const paper = paperById(paperId);
  if (!paper) notFound();

  return <ExamWorkspace paper={paper} availableMarks={availableMarks(paper)} />;
}
