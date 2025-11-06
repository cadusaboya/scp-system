export default function ProjectPage({ params }: { params: { id: string } }) {
  return <div>Projeto ID: {params.id}</div>;
}