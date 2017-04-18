/**
 * Created by cahlering on 7/8/14.
 */

exports.shuffle = function(array) {
  var counter = array.length, temp, index;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}