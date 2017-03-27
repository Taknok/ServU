'use strict;'

module.exports = function() {
    return {
        userList : [],
        /*
         * Save the movie inside the "db".
         */
        save(user) {
            this.userList.push(user);
            return 1;           
        },
        /*
         * Retrieve a movie with a given id or return all the movies if the id is undefined.
         */
        find(username) {
            if(username) {
                return this.userList.find(element => {
                        return element.username === username;
                    }); 
            }else {
                return this.userList;
            }
        },
        /*
         * Delete a movie with the given id.
         */
        remove(username) {
            var found = 0;
            this.userList = this.userList.filter(element => {
                    if(element.username === username) {
                        found = 1;
                    }else {
                        return element.username !== username;
                    }
                });
            return found;           
        },
        /*
         * Update a movie with the given id
         */
        update(username, user) {
            var userIndex = this.userList.findIndex(element => {
                return element.username === username;
            });
            if(userIndex !== -1) {
                this.userList[userIndex].title = movie.title;
                this.userList[userIndex].year = movie.year;
                return 1;
            }else {
                return 0;
            }
        }       
    }
};  