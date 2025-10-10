function Homepage() {
  return (
    <main className="min-h-screen">
      {/* your homepage content */}
    </main>
  );
}

Homepage.getLayout = (page: React.ReactNode) => (
  <Layout fullWidth /* optionally: showMarquee={false} */>
    {page}
  </Layout>
);

export default Homepage;
