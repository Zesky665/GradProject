console.log("This works");

subs = document.getElementById("subs").innerHTML;

subs_input = document.getElementById("subs_input");
subs_form = document.getElementById("subs_form");
users_list = document.getElementById("users_list");

window.onload = fill_input();

function fill_input() {
    //console.log("this works")
    subs_str = subs.replace(/"/g,'');
    subs_form.setAttribute('value', subs_str);
};

function exists(list, entry) {
    entry = entry;
    if(list.search(entry) != -1){
        return true;
    }else{
        return false;
    }
};

function add_sub() {
    console.log(subs_form.value)
    if (subs_form.value == '') {
        //console.log(subs)
        subs_str = subs.replace(/"/g,'');
        subs_form.setAttribute('value', subs_str);

    } else {
        subs_form_value = subs_form.getAttribute('value');
        subs_input_value = subs_input.value;
        entry = ", " + subs_input_value;

        if(exists(subs_form_value,entry)) {
         alert("already exists");
        }else{
        
        
        users_list.innerHTML += '<li class="list-group-item" id="'+subs_input_value+'"> <a href="/user/'+subs_input_value+'" >'+subs_input_value+' - pending </a> <span class="btn btn-danger" onclick="remove_sub('+subs_input_value+')">X</span> </li>' 

        subs_form.setAttribute('value', subs_form_value + entry);
        };
    };
    //here
    subs_input.value = '';
};

function remove_sub(entry_id) {
    subs_form_value = subs_form.getAttribute('value');

    subs_str = subs_form_value.replace(', '+entry_id,'');
    console.log(subs_str);
    subs_form.setAttribute('value', subs_str);
    var node = document.getElementById(entry_id);
    node.remove();
};