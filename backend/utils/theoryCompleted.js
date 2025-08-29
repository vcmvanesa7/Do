
async function getCompletedLevelIds(id_user) {
    const { data, error } = await supabase
      .from("user_levels")
      .select("id_level")
      .eq("id_user", id_user)
      .eq("completed", true);
  
    if (error) throw error;
    return data.map((r) => r.id_level);
  };

  export { getCompletedLevelIds }