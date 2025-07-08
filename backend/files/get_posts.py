# get_posts.py

def process_posts(posts):
    # posts is a list of posts (maybe list of strings or dicts)
    print("Processing posts in get_posts.py:", posts)
    # Your processing logic here
    return [p.upper() for p in posts]  # just example processing
