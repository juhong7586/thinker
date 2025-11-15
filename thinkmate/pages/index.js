// Redirect root to /graph
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/graph',
      permanent: false,
    },
  }
}

export default function IndexRedirect() {
  return null
}