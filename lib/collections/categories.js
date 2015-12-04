Categories = new Mongo.Collection("categories");

i = 0;

Main:
do {
  j=0;
  do {
    j+=1;
    if(j=== 10) break Main;
  }
  while(j<100);
  i+= 1;
}
while(i < 100);
console.log(i);
console.log(j);