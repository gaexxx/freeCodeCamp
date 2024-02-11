import hashlib

def crack_sha1_hash(hash, use_salts=False):
    file = open("top-10000-passwords.txt")
    for word in file:
        word = word.strip()
        hashed_word = hashlib.sha1(word.encode()).hexdigest()
        if hash == hashed_word:
            return word
            
