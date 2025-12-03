const serverHostName = process.env.DATABRICKS_SERVER_HOSTNAME;
const token = process.env.DATABRICKS_TOKEN;
const httpPath = process.env.DATABRICKS_HTTP_PATH;

export default async function getStudentsByCountryServer(country) {
  // Build SQL and optionally filter by country to avoid fetching all rows.
  let where = '';
  if (country) {
    // Basic escaping: double single-quotes inside the supplied string
    const safe = String(country).replace(/'/g, "''");
    where = ` WHERE country = '${safe}'`;
  }
  const sql_student = `SELECT * FROM workspace.students.all_students${where}`;

  try {
    let studentData = [];
    if (serverHostName && token && httpPath) {
      try {
        // Use dynamic import to satisfy ESM lint rules and avoid require()
        const mod = await import('@databricks/sql');
        const { DBSQLClient } = mod;
        const client = new DBSQLClient();
        const connectOptions = { token, host: serverHostName, path: httpPath };
        await client.connect(connectOptions);
        const session = await client.openSession();
        const queryOperation = await session.executeStatement(sql_student, { runAsync: true });
        const result = await queryOperation.fetchAll();
        await queryOperation.close();
        await session.close();
        await client.close();
        studentData = result || [];
        console.log(`Fetched ${studentData.length} student records${country ? ' for country: ' + country : ''}`);
      } catch (err) {
        console.error('Databricks client query failed for student data:', err.message || err);
        studentData = [];
      }
    }

    const studentRows = (studentData || [])
      .map(r => {
        if (!r) return null;
        if (typeof r === 'object' && !Array.isArray(r) && r.country) {
          return {
            country: r.country,
            studentID: r.CNTSTUID,
            grade: r.ST001D01T,
            gender: r.ST004D01T,
            school: r.STRATUM,
            ave_emp: Number(r.ave_emp ?? r.empathy_score ?? r.empathy ?? NaN),
            ave_cr: Number(r.ave_cr ?? r.overall_cr ?? r.cr ?? NaN),
            ave_cr_social: Number(r.ave_cr_social ?? r.social_cr ?? NaN)
          };
        }
        if (Array.isArray(r)) {
          return {
            country: r[0],
            studentID: r[1],
            grade: r[2],
            gender: r[3],
            school: r[4],
            ave_emp: Number(r[5] ?? NaN),
            ave_cr: Number(r[6] ?? NaN),
            ave_cr_social: Number(r[7] ?? NaN)
          };
        }
        return null;
      })
      .filter(Boolean);

    return studentRows;
  } catch (err) {
    console.error('getStudentsByCountry unexpected error:', err);
    return [];
  }
}
