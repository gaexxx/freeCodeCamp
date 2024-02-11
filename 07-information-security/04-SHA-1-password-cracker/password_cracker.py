import hashlib

def crack_sha1_hash(hash, use_salts=False):
    if use_salts == False:
        with open("top-10000-passwords.txt", "r") as pass_file: # with closes the file after each iteration
            for word in pass_file:
                word = word.strip()
                hashed_word = hashlib.sha1(word.encode()).hexdigest()
                if hash == hashed_word:
                    return word
            return "PASSWORD NOT IN DATABASE"

    if use_salts == True:
        with open("known-salts.txt", "r") as salt_file: # with closes the file after each iteration
            for salt in salt_file:
                salt = salt.strip()
                with open("top-10000-passwords.txt", "r") as pass_file: # with closes the file after each iteration
                    for word in pass_file:
                        word = word.strip()
                        salt_prepend = salt + word
                        salt_append = word + salt
                        hashed_word_sp = hashlib.sha1(salt_prepend.encode()).hexdigest()
                        hashed_word_sa = hashlib.sha1(salt_append.encode()).hexdigest()
                        if hash == hashed_word_sp or hash == hashed_word_sa:
                            return word
        return "PASSWORD NOT IN DATABASE"
