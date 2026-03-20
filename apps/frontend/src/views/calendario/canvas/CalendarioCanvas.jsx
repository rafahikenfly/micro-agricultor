import { NoUser } from "../../../components/common/NoUser";

export default function CalendarioCanvas () {
  // Recupera usuário
  const { user } = useAuth();
  if (!user) return <NoUser />;

  // Recupera horta
  const { usuarioId } = useParams();
  if (!usuarioId) return <div>Selecione um usuario.</div>

  return (
    <div>
        PLACEHOLDER
    </div>
  )
}