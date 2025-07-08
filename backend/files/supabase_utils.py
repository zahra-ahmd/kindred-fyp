from supabase import create_client, Client

SUPABASE_URL = 'SUPABASE URL'
SUPABASE_ANON_KEY = 'SUPABASE ANON KEY'



supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def get_user_posts(user_id: str):
    response = (
        supabase
        .table("posts")
        .select("content")
        .eq("user_id", user_id)
        .execute()
    )
    print("Response type:", type(response))
    print("Response dir:", dir(response))
    print("Response repr:", repr(response))

    # Try to get .data safely
    posts_data = getattr(response, "data", None)
    if posts_data is None:
        print("No data found in response")
        return []

    posts = [post["content"] for post in posts_data]
    return posts
